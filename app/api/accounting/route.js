// app/api/accounting/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../lib/mongodb";
import Order from "../../models/Order";
import Product from "../../models/Product";
import Category from "../../models/Category";
import { getCurrentUser } from "../../lib/authUtils";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Get auth token from cookies
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Verify user
    const user = getCurrentUser(token);
    if (!user || (user.role !== 1 && user.role !== 2)) {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin access required." },
        { status: 403 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end);
    if (!startDate) {
      start.setDate(start.getDate() - 30);
    }

    // Build query
    const query = {
      createdAt: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
      status: { $nin: ["cancelled"] },
    };

    // Fetch orders
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    // Fetch all products and categories for calculations
    const products = await Product.find({}).lean();
    const categories = await Category.find({}).lean();

    // Create category map
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat._id.toString()] = cat;
    });

    // Calculate accounting data
    const accountingData = {
      summary: {
        totalOrders: orders.length,
        totalRevenue: 0,
        totalDiscount: 0,
        totalDeliveryCharge: 0,
        netRevenue: 0,
        averageOrderValue: 0,
      },
      paymentBreakdown: {
        cod: { count: 0, amount: 0 },
        online: { count: 0, amount: 0 },
        bank: { count: 0, amount: 0 },
      },
      statusBreakdown: {
        pending: { count: 0, amount: 0 },
        processing: { count: 0, amount: 0 },
        shipped: { count: 0, amount: 0 },
        delivered: { count: 0, amount: 0 },
      },
      topProducts: [],
      categorySales: [],
      dailySales: [],
      monthlySales: [],
      orders: orders,
      dateRange: {
        start: start,
        end: end,
      },
    };

    // Process orders
    const productSales = {};
    const categorySalesMap = {};
    const dailySalesMap = {};
    const monthlySalesMap = {};

    orders.forEach((order) => {
      // Summary calculations
      accountingData.summary.totalRevenue += order.total || 0;
      accountingData.summary.totalDiscount += order.discount || 0;
      accountingData.summary.totalDeliveryCharge += order.deliveryCharge || 0;

      // Payment breakdown
      const paymentMethod = order.paymentMethod || "cod";
      if (accountingData.paymentBreakdown[paymentMethod]) {
        accountingData.paymentBreakdown[paymentMethod].count += 1;
        accountingData.paymentBreakdown[paymentMethod].amount +=
          order.total || 0;
      }

      // Status breakdown
      const status = order.status || "pending";
      if (accountingData.statusBreakdown[status]) {
        accountingData.statusBreakdown[status].count += 1;
        accountingData.statusBreakdown[status].amount += order.total || 0;
      }

      // Product sales
      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          const productId = item.productId.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.name,
              productId: productId,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[productId].quantity += item.quantity || 0;
          productSales[productId].revenue += item.total || 0;
        });
      }

      // Category sales
      order.items.forEach((item) => {
        const product = products.find(
          (p) => p._id.toString() === item.productId.toString(),
        );
        if (product) {
          const categoryId = product.category.toString();
          if (!categorySalesMap[categoryId]) {
            categorySalesMap[categoryId] = {
              categoryId: categoryId,
              categoryName: categoryMap[categoryId]?.name || "Unknown",
              revenue: 0,
              orderCount: 0,
            };
          }
          categorySalesMap[categoryId].revenue += item.total || 0;
          categorySalesMap[categoryId].orderCount += 1;
        }
      });

      // Daily sales
      const dateKey = order.createdAt.toISOString().split("T")[0];
      if (!dailySalesMap[dateKey]) {
        dailySalesMap[dateKey] = {
          date: dateKey,
          revenue: 0,
          orders: 0,
        };
      }
      dailySalesMap[dateKey].revenue += order.total || 0;
      dailySalesMap[dateKey].orders += 1;

      // Monthly sales
      const monthKey = order.createdAt.toISOString().substring(0, 7);
      if (!monthlySalesMap[monthKey]) {
        monthlySalesMap[monthKey] = {
          month: monthKey,
          revenue: 0,
          orders: 0,
        };
      }
      monthlySalesMap[monthKey].revenue += order.total || 0;
      monthlySalesMap[monthKey].orders += 1;
    });

    // Calculate net revenue
    accountingData.summary.netRevenue =
      accountingData.summary.totalRevenue -
      accountingData.summary.totalDiscount;

    // Calculate average order value
    accountingData.summary.averageOrderValue =
      accountingData.summary.totalOrders > 0
        ? accountingData.summary.netRevenue / accountingData.summary.totalOrders
        : 0;

    // Top products (top 10 by revenue)
    accountingData.topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Category sales
    accountingData.categorySales = Object.values(categorySalesMap).sort(
      (a, b) => b.revenue - a.revenue,
    );

    // Daily sales (last 30 days)
    accountingData.dailySales = Object.values(dailySalesMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    // Monthly sales
    accountingData.monthlySales = Object.values(monthlySalesMap).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    return NextResponse.json({
      success: true,
      data: accountingData,
    });
  } catch (error) {
    console.error("Accounting API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch accounting data",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
