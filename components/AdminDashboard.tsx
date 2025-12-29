import React, { useEffect, useState } from 'react';
import { getUsers, getMatches, getAllReports, banUser, unbanUser, updateReportStatus, getReportsForUser } from '../services/dbService';
import { User, Report, ReportStatus, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, AlertTriangle, ShieldCheck, Ban, CheckCircle, X, Eye, Search, History, Unlock } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [stats, setStats] = useState({ users: 0, matches: 0, reports: 0 });
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // User Registry State
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null);
  const [userReportsHistory, setUserReportsHistory] = useState<Report[]>([]);

  const refreshData = () => {
    const data = getUsers();
    const matchData = getMatches();
    const reportData = getAllReports();
    
    setUsers(data);
    setReports(reportData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setStats({
      users: data.length,
      matches: matchData.length,
      reports: reportData.length
    });
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]); // Refresh when tab changes

  const handleBanUser = (userId: string, reportId?: string) => {
    if (window.confirm('Are you sure you want to PERMANENTLY BAN this user?')) {
      banUser(userId);
      if (reportId) {
          updateReportStatus(reportId, ReportStatus.RESOLVED);
      }
      refreshData();
      setSelectedReport(null);
    }
  };

  const handleUnbanUser = (userId: string) => {
      if (window.confirm('Are you sure you want to UNBAN this user?')) {
          unbanUser(userId);
          refreshData();
      }
  };

  const handleDismissReport = (reportId: string) => {
    updateReportStatus(reportId, ReportStatus.DISMISSED);
    refreshData();
    setSelectedReport(null);
  };

  const handleViewUserHistory = (user: User) => {
      const history = getReportsForUser(user.id);
      setUserReportsHistory(history);
      setSelectedUserForHistory(user);
  };

  const getUserName = (id: string) => {
    const u = users.find(user => user.id === id);
    return u ? u.fullName : 'Unknown User';
  };

  const filteredUsers = users.filter(u => 
    u.role !== UserRole.ADMIN && 
    (u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
     u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const chartData = [
    { name: 'Users', count: stats.users },
    { name: 'Matches', count: stats.matches },
    { name: 'Reports', count: stats.reports },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
           <p className="text-slate-500">Overview and Moderation</p>
        </div>
        <div className="flex gap-2">
             <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'overview' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
             >
                Overview
             </button>
             <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'users' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
             >
                User Registry
             </button>
        </div>
      </div>

      {activeTab === 'overview' && (
          <div className="animate-fade-in space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                    <Users size={24} />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Total Users</p>
                    <h3 className="text-2xl font-bold text-slate-800">{stats.users}</h3>
                </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Active Matches</p>
                    <h3 className="text-2xl font-bold text-slate-800">{stats.matches}</h3>
                </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-red-50 text-red-600 rounded-xl">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Total Reports</p>
                    <h3 className="text-2xl font-bold text-slate-800">{stats.reports}</h3>
                </div>
                </div>
            </div>

            {/* Charts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Platform Overview</h2>
                <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="count" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Reports List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={20} />
                        Recent Reports
                    </h2>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                    <tr>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Reported User</th>
                        <th className="px-6 py-4 font-medium">Reason</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {reports.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No active reports.</td>
                        </tr>
                    ) : (
                        reports.slice(0, 10).map(report => { // Show last 10
                            const reportedUser = users.find(u => u.id === report.reportedUserId);
                            const isResolved = report.status === ReportStatus.RESOLVED;
                            const isDismissed = report.status === ReportStatus.DISMISSED;
                            
                            return (
                                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                    {new Date(report.timestamp).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">{reportedUser?.fullName || 'Unknown'}</div>
                                    <div className="text-xs text-slate-400">{reportedUser?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md font-medium text-xs">
                                        {report.reason}
                                    </span>
                                    </td>
                                    <td className="px-6 py-4">
                                    {isResolved ? (
                                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                                        <CheckCircle size={12} /> Banned
                                        </span>
                                    ) : isDismissed ? (
                                        <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-full text-xs font-bold">
                                        <X size={12} /> Dismissed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-bold">
                                        <AlertTriangle size={12} /> Pending
                                        </span>
                                    )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                        onClick={() => setSelectedReport(report)}
                                        className="text-slate-600 hover:text-primary-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                                        title="View Details"
                                        >
                                        <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
                </div>
            </div>
          </div>
      )}

      {activeTab === 'users' && (
          <div className="animate-fade-in bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <Users className="text-slate-500" size={20} />
                     All Users
                 </h2>
                 <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                 </div>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium">Reports</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{u.fullName}</div>
                                    <div className="text-xs text-slate-500">{u.email}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{u.role}</td>
                                <td className="px-6 py-4">
                                    {u.reportsCount > 0 ? (
                                        <span className="text-red-600 font-bold flex items-center gap-1">
                                            <AlertTriangle size={14} /> {u.reportsCount}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">0</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {u.isBanned ? (
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold">Banned</span>
                                    ) : (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">Active</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleViewUserHistory(u)}
                                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                                        title="View Comments & History"
                                    >
                                        <History size={18} />
                                    </button>
                                    {u.isBanned ? (
                                        <button 
                                            onClick={() => handleUnbanUser(u.id)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                            title="Unban User"
                                        >
                                            <Unlock size={18} />
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleBanUser(u.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Ban User"
                                        >
                                            <Ban size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
          </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
              <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
                 <div>
                    <h3 className="text-xl font-bold text-slate-800">Report Details</h3>
                    <p className="text-sm text-slate-500">ID: {selectedReport.id}</p>
                 </div>
                 <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={24} />
                 </button>
              </div>
              
              <div className="p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reported User</p>
                       <p className="font-semibold text-slate-800">{getUserName(selectedReport.reportedUserId)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reported By</p>
                       <p className="font-semibold text-slate-800">{getUserName(selectedReport.reporterId)}</p>
                    </div>
                 </div>

                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason</p>
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-bold text-sm">
                       {selectedReport.reason}
                    </span>
                 </div>

                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Comments (Description)</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm italic">
                       "{selectedReport.description}"
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                 {selectedReport.status === ReportStatus.PENDING ? (
                   <>
                      <button 
                        onClick={() => handleDismissReport(selectedReport.id)}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        Dismiss
                      </button>
                      <button 
                        onClick={() => handleBanUser(selectedReport.reportedUserId, selectedReport.id)}
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Ban size={18} /> Ban User
                      </button>
                   </>
                 ) : (
                    <div className="w-full py-3 text-center text-slate-500 font-medium bg-slate-200 rounded-xl">
                       This report has been {selectedReport.status.toLowerCase()}.
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* User History Modal (Comments written on someone) */}
      {selectedUserForHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[80vh] flex flex-col">
                  <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                      <div>
                          <h3 className="text-xl font-bold text-slate-800">Report History</h3>
                          <p className="text-sm text-slate-500">For {selectedUserForHistory.fullName}</p>
                      </div>
                      <button onClick={() => setSelectedUserForHistory(null)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="p-6 overflow-y-auto">
                      {userReportsHistory.length === 0 ? (
                          <div className="text-center text-slate-400 py-8">No reports or comments found for this user.</div>
                      ) : (
                          <div className="space-y-4">
                              {userReportsHistory.map(r => (
                                  <div key={r.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                      <div className="flex justify-between items-start mb-2">
                                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">{r.reason}</span>
                                          <span className="text-xs text-slate-400">{new Date(r.timestamp).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-slate-700 text-sm">"{r.description}"</p>
                                      <div className="mt-2 text-xs text-slate-500">Reported by: {getUserName(r.reporterId)}</div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;