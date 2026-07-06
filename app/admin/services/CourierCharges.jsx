// app/admin/services/CourierCharges.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CourierCharges = () => {
  const { user } = useAuth();
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    weightFrom: '',
    weightTo: '',
    insideDhaka: '',
    outsideDhaka: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Check if user has admin/editor role
  const isAdmin = user?.role === 1 || user?.role === 2;

  // Fetch charges
  const fetchCharges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courier-charges');
      const data = await response.json();
      
      if (data.success) {
        setCharges(data.charges);
      } else {
        toast.error(data.message || 'Failed to fetch charges');
      }
    } catch (error) {
      console.error('Fetch charges error:', error);
      toast.error('Failed to load courier charges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //eslint-disable-next-line
    fetchCharges();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const { weightFrom, weightTo, insideDhaka, outsideDhaka } = formData;

    if (!weightFrom || parseFloat(weightFrom) < 0) {
      errors.weightFrom = 'Valid starting weight is required';
    }
    if (!weightTo || parseFloat(weightTo) <= parseFloat(weightFrom)) {
      errors.weightTo = 'Ending weight must be greater than starting weight';
    }
    if (!insideDhaka || parseFloat(insideDhaka) < 0) {
      errors.insideDhaka = 'Valid inside Dhaka charge is required';
    }
    if (!outsideDhaka || parseFloat(outsideDhaka) < 0) {
      errors.outsideDhaka = 'Valid outside Dhaka charge is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open modal for create/edit
  const openModal = (charge = null) => {
    if (charge) {
      setEditingId(charge._id);
      setFormData({
        weightFrom: charge.weightFrom.toString(),
        weightTo: charge.weightTo.toString(),
        insideDhaka: charge.insideDhaka.toString(),
        outsideDhaka: charge.outsideDhaka.toString(),
      });
    } else {
      setEditingId(null);
      setFormData({
        weightFrom: '',
        weightTo: '',
        insideDhaka: '',
        outsideDhaka: '',
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      weightFrom: '',
      weightTo: '',
      insideDhaka: '',
      outsideDhaka: '',
    });
    setFormErrors({});
  };

  // Handle submit (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix all errors');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingId 
        ? `/api/courier-charges/${editingId}`
        : '/api/courier-charges';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weightFrom: parseFloat(formData.weightFrom),
          weightTo: parseFloat(formData.weightTo),
          insideDhaka: parseFloat(formData.insideDhaka),
          outsideDhaka: parseFloat(formData.outsideDhaka),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingId ? 'Charge updated successfully!' : 'Charge created successfully!');
        fetchCharges();
        closeModal();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save charge');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this courier charge?')) {
      return;
    }

    try {
      const response = await fetch(`/api/courier-charges/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Charge deleted successfully!');
        fetchCharges();
      } else {
        toast.error(data.message || 'Failed to delete charge');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete charge');
    }
  };

  // Calculate total charges for display
  const getTotalCharges = () => charges.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-[#559F34] text-4xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#3A393D]">Courier Charges</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total {getTotalCharges()} weight ranges configured
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => openModal()}
            className="bg-[#559F34] hover:bg-[#45802A] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <FaPlus /> Add Charge
          </button>
        )}
      </div>

      {/* Charges Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left py-3 px-4 font-semibold text-[#3A393D] text-sm">
                Weight Range (KG)
              </th>
              <th className="text-left py-3 px-4 font-semibold text-[#3A393D] text-sm">
                Inside Dhaka (Tk)
              </th>
              <th className="text-left py-3 px-4 font-semibold text-[#3A393D] text-sm">
                Outside Dhaka (Tk)
              </th>
              {isAdmin && (
                <th className="text-center py-3 px-4 font-semibold text-[#3A393D] text-sm">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {charges.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-gray-500">
                  No courier charges configured yet
                </td>
              </tr>
            ) : (
              charges.map((charge) => (
                <tr key={charge._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-[#3A393D]">
                    {charge.weightFrom} - {charge.weightTo}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-[#559F34]">
                    ৳{charge.insideDhaka}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-[#E67E22]">
                    ৳{charge.outsideDhaka}
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openModal(charge)}
                          className="text-[#559F34] hover:text-[#3A393D] transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(charge._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeModal}></div>
            
            <div className="relative bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#3A393D]">
                  {editingId ? 'Edit Courier Charge' : 'Add New Courier Charge'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Weight From */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Weight From (KG)
                    </label>
                    <input
                      type="number"
                      name="weightFrom"
                      value={formData.weightFrom}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full text-gray-600 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm ${
                        formErrors.weightFrom ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 0"
                    />
                    {formErrors.weightFrom && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.weightFrom}</p>
                    )}
                  </div>

                  {/* Weight To */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Weight To (KG)
                    </label>
                    <input
                      type="number"
                      name="weightTo"
                      value={formData.weightTo}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full text-gray-600 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm ${
                        formErrors.weightTo ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 0.15"
                    />
                    {formErrors.weightTo && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.weightTo}</p>
                    )}
                  </div>

                  {/* Inside Dhaka */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Inside Dhaka (Tk)
                    </label>
                    <input
                      type="number"
                      name="insideDhaka"
                      value={formData.insideDhaka}
                      onChange={handleInputChange}
                      step="1"
                      min="0"
                      className={`w-full text-gray-600 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm ${
                        formErrors.insideDhaka ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 50"
                    />
                    {formErrors.insideDhaka && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.insideDhaka}</p>
                    )}
                  </div>

                  {/* Outside Dhaka */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Outside Dhaka (Tk)
                    </label>
                    <input
                      type="number"
                      name="outsideDhaka"
                      value={formData.outsideDhaka}
                      onChange={handleInputChange}
                      step="1"
                      min="0"
                      className={`w-full text-gray-600 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm ${
                        formErrors.outsideDhaka ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 110"
                    />
                    {formErrors.outsideDhaka && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.outsideDhaka}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#559F34] hover:bg-[#45802A] text-white py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <FaSave /> {editingId ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-[#3A393D] rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourierCharges;