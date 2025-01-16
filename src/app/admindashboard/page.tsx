"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Contribution = {
  project: string;
  url: string;
};

type UserStats = {
  user_id: number;
  user_name: string;
  github_username: string;
  github_url: string;
  github_img_url: string;
  pr_count: number;
  score: number;
  banned: boolean;
};

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "contributions">("users");
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("http://localhost:8080/admin/user");
      const data = await response.json();
      setUsers(data.users || []);  
      setFilteredUsers(data.users || []);
    };
    fetchUsers();
  }, []);


  const handleOpenModal = (user: UserStats) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };


  const handleEdit = (field: keyof UserStats, value: any) => {
    if (selectedUser) {
      setSelectedUser({ ...selectedUser, [field]: value });
    }
  };


  const handleSaveChanges = () => {
    if (selectedUser) {
      setUsers(users.map((user) => (user.user_id === selectedUser.user_id ? selectedUser : user)));
    }
    handleCloseModal();
  };


  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (user) =>
          user.user_name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, users]);


  const handleDelete = async (username: string) => {
    if (window.confirm(`Are you sure you want to delete ${username}?`)) {
      await fetch(`http://localhost:8080/admin/user/${username}`, {
        method: "DELETE",
      });
      setUsers(users.filter((user) => user.user_name !== username));
    }
  };


  const handleBan = async (username: string) => {
    if (window.confirm(`Are you sure you want to ban ${username}?`)) {
      await fetch(`http://localhost:8080/admin/user/${username}/ban`, {
        method: "POST",
      });
      alert(`${username} has been banned.`);
      setUsers(
        users.map((user) =>
          user.user_name === username ? { ...user, banned: true } : user
        )
      );
    }
  };


  const handleLogout = async () => {
    if (window.confirm(`Are you sure you want to logout?`)) {
      await fetch(`http://localhost:8080/admin/logout`, {
        method: "POST",
      });
      clearAllCookies();
      router.replace("/admin");
    }
  };


  const clearAllCookies = () => {
    const allCookies = document.cookie.split(";");
    allCookies.forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  };


  const renderContent = () => {
    if (activeTab === "users") {
      return (
        <div>
          <div className="p-2 text-lg">Total User : {users.length}</div>
          {filteredUsers.map((user) => (
            <div
              key={user.user_id}
              className={`flex items-center justify-between p-4 rounded-lg mb-4 ${user.banned ? "bg-red-900 text-red line-through" : "bg-gray-800"}`}
            >
              <div className="flex items-center">
                <img
                  src={user.github_img_url}
                  alt={user.user_name}
                  className={`w-10 h-10 rounded-full mr-4 ${user.banned ? 'grayscale' : ''}`}
                />
                <div>
                  <h2 className="text-gray-100 font-bold">{user.user_name}</h2>
                  <h3 className="text-gray-300">Score: {user.score}</h3>
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="text-blue-500 text-sm"
                  >
                    View Profile
                  </button>
                </div>
              </div>
              {user.banned ? (
                <div>
                  <button
                    onClick={() => handleBan(user.user_name)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2"
                  >
                    UnBan
                  </button>
                  <button
                    onClick={() => handleDelete(user.user_name)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => handleBan(user.user_name)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2"
                  >
                    Ban
                  </button>
                  <button
                    onClick={() => handleDelete(user.user_name)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "contributions") {
      return <div>Contributions tab content goes here</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
        <button onClick={handleLogout} className="text-sm font-bold text-white bg-blue-700 rounded-lg p-3">
          Logout
        </button>
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>
      <nav className="flex mb-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 mr-4 rounded-lg ${activeTab === "users" ? "bg-blue-500" : "bg-gray-700"} text-white`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("contributions")}
          className={`px-4 py-2 rounded-lg ${activeTab === "contributions" ? "bg-blue-500" : "bg-gray-700"} text-white`}
        >
          Contributions
        </button>
      </nav>
      {renderContent()}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <div className="mb-4">
              <h3 className="text-gray-300">Username: {selectedUser.user_name}</h3>
              <a
                href={selectedUser.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm"
              >
                Visit Profile
              </a>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Score</label>
              <input
                type="number"
                value={selectedUser.score}
                onChange={(e) => handleEdit("score", Number(e.target.value))}
                className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 w-full"
              />
            </div>
            <div className="flex justify-end">
              <button onClick={handleCloseModal} className="bg-gray-600 text-white px-4 py-2 rounded-lg mr-2">
                Cancel
              </button>
              <button onClick={handleSaveChanges} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
