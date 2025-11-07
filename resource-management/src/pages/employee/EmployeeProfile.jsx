import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUser, updateUser, addSkill, removeSkill, addCertification, removeCertification } from '../../services/database';
import { Plus, X, Save, Award, Briefcase } from 'lucide-react';

const EmployeeProfile = () => {
  const { currentUser, userProfile, loadUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    department: '',
    designation: '',
    email: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        department: userProfile.department || '',
        designation: userProfile.designation || '',
        email: userProfile.email || ''
      });
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUser(currentUser.uid, {
        fullName: formData.fullName,
        department: formData.department,
        designation: formData.designation
      });

      await loadUserProfile(currentUser.uid);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    try {
      await addSkill(currentUser.uid, newSkill.trim());
      await loadUserProfile(currentUser.uid);
      setNewSkill('');
      alert('Skill added successfully!');
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Error adding skill');
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      await removeSkill(currentUser.uid, skill);
      await loadUserProfile(currentUser.uid);
      alert('Skill removed successfully!');
    } catch (error) {
      console.error('Error removing skill:', error);
      alert('Error removing skill');
    }
  };

  const handleAddCertification = async (e) => {
    e.preventDefault();
    if (!newCert.trim()) return;

    try {
      await addCertification(currentUser.uid, newCert.trim());
      await loadUserProfile(currentUser.uid);
      setNewCert('');
      alert('Certification added successfully!');
    } catch (error) {
      console.error('Error adding certification:', error);
      alert('Error adding certification');
    }
  };

  const handleRemoveCertification = async (certification) => {
    try {
      await removeCertification(currentUser.uid, certification);
      await loadUserProfile(currentUser.uid);
      alert('Certification removed successfully!');
    } catch (error) {
      console.error('Error removing certification:', error);
      alert('Error removing certification');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your personal information, skills, and certifications
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Personal Information
          </h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {userProfile?.fullName || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {userProfile?.email || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {userProfile?.department || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Designation</p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {userProfile?.designation || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-base font-semibold text-gray-900 mt-1 capitalize">
                {userProfile?.role?.replace('_', ' ') || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Joining Date</p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {userProfile?.joiningDate
                  ? new Date(userProfile.joiningDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className="inline-flex mt-1 px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {userProfile?.status || 'Active'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Skills Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
        </div>

        <form onSubmit={handleAddSkill} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a new skill (e.g., React, Python, Project Management)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              Add
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2">
          {userProfile?.skills && userProfile.skills.length > 0 ? (
            userProfile.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            ))
          ) : (
            <p className="text-gray-500">No skills added yet. Add your first skill above!</p>
          )}
        </div>
      </div>

      {/* Certifications Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="text-green-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Certifications</h2>
        </div>

        <form onSubmit={handleAddCertification} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              placeholder="Add a new certification (e.g., AWS Certified Solutions Architect)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus size={18} />
              Add
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {userProfile?.certifications && userProfile.certifications.length > 0 ? (
            userProfile.certifications.map((cert, index) => (
              <div
                key={index}
                className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Award className="text-green-600" size={18} />
                  <p className="text-sm font-medium text-gray-900">{cert}</p>
                </div>
                <button
                  onClick={() => handleRemoveCertification(cert)}
                  className="p-2 hover:bg-green-100 rounded-full text-red-600 hover:text-red-700 transition-colors"
                  title="Remove certification"
                >
                  <X size={18} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No certifications added yet. Add your first certification above!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
