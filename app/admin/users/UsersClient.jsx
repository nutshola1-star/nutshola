"use client";

import React, { useState, useEffect } from 'react';
import AdminMenu from '../../components/menu/AdminMenu';
import { FaBars, FaTimes, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
const UsersClient = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // User Management State
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const initialFormState = {
    name: '', email: '', password: '', phone: '', address: '', district: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch all users on mount (Make sure you have a GET /api/users route)
  useEffect(() => {
    //eslint-disable-next-line
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData(initialFormState);
    setEditingUserId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Leave blank, only update if the user types a new one
      phone: user.phone || '',
      address: user.address || '',
      district: user.district || ''
    });
    setEditingUserId(user._id || user.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const url = editingUserId ? `/api/user/${editingUserId}` : '/api/user/register';
    const method = editingUserId ? 'PUT' : 'POST';

    // Remove empty password field if we are just editing and don't want to change it
    const payload = { ...formData };
    if (editingUserId && !payload.password) {
      delete payload.password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsModalOpen(false);
        fetchUsers(); // Refresh the list
        toast.success('User saved successfully');
      } else {
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/user/${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        setUsers(users.filter(user => (user._id || user.id) !== id));
        toast.success('User deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans relative md:px-10">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden transition-opacity z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Left side: Sidebar */}
      <div className={`
        fixed top-20 bottom-0 left-0 transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:flex-shrink-0 z-50
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminMenu 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          setMobileMenuOpen={setIsMobileMenuOpen} 
        />
      </div>
      
      {/* Right side: Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="bg-white shadow-sm px-4 md:px-8 py-4 md:py-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#3A393D]">Users</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Manage user accounts and permissions.</p>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-[#3A393D] hover:text-[#559F34] focus:outline-none p-2 rounded-md transition-colors"
          >
            {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </header>

        <main className="px-4 md:px-8 pb-8 flex-1">
          {/* Action Bar */}
          <div className="flex justify-end mb-4">
            <button 
              onClick={openCreateModal}
              className="bg-[#559F34] hover:bg-[#438228] text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-sm"
            >
              <FaPlus /> Add New User
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id || user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <FaEdit className="inline text-lg" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id || user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingUserId ? 'Edit User' : 'Create New User'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border text-gray-600 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#559F34]" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required disabled={!!editingUserId} type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-300 text-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#559F34] disabled:bg-gray-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUserId && <span className="text-xs text-gray-400">(Leave blank to keep current)</span>}
                </label>
                <input required={!editingUserId} type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full border text-gray-600 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#559F34]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border text-gray-600 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#559F34]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleInputChange} className="w-full border text-gray-600 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#559F34]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full border text-gray-600 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#559F34]" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-[#559F34] text-white rounded-md hover:bg-[#438228] disabled:bg-gray-400">
                  {isLoading ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersClient;