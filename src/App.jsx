import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LoginPage from './Pages/LoginPage';
import HomePage from './Pages/HomePage';
import useAuthUser from './Hooks/useAuthUser';
import PageNotFound from './Pages/PageNotFound';
import Layout from './Components/Layout';
import ColorPage from './Pages/ColorPage';
import ClarityPage from './Pages/ClarityPage';
import ShapePage from './Pages/ShapePage';
import PartyPage from './Pages/PartyPage';
import PageLoader from './Components/PageLoader';
import StatusPage from './Pages/StatusPage';
import PaymentStatusPage from './Pages/PaymentStatusPage';
import FormPage from './Pages/FormPage';
import DiamondTable from './Pages/DiamondTable';
import { useState } from 'react';
import RatePage from './Pages/RatePage';
import RecordPage from './Pages/RecordPage';
import EmployeePage from './Pages/EmployeePage';
import AttendancePage from './Components/AttendancePage';

const App = () => {

  const { authLoading, authUser } = useAuthUser();

  const [showTotal, setShowTotal] = useState(false);
  const [showIcon, setShowIcon] = useState(true);

  const isAuthenticated = Boolean(authUser?.data);

  if (authLoading) return <PageLoader />;

  return (
    <div className="h-screen">
      <Routes>
        <Route path='/login' element={!isAuthenticated ? <LoginPage /> : <Navigate to='/dashboard' />} />
        
        <Route path='/' element={!isAuthenticated ? <Navigate to='/login' /> : <Navigate to='/dashboard' />} />

        <Route path='/dashboard' element={isAuthenticated ? <Layout user={authUser?.data?.userName}><HomePage /></Layout> : <Navigate to='/login' />} />
        <Route path='/color' element={isAuthenticated ? <Layout user={authUser?.data?.userName}><ColorPage /></Layout> : <Navigate to='/login' />} />
        <Route path='/clarity' element={isAuthenticated ? <Layout user={authUser?.data?.userName}><ClarityPage /></Layout> : <Navigate to='/login' />} />
        <Route path='/shape' element={isAuthenticated ? <Layout user={authUser?.data?.userName}><ShapePage /></Layout> : <Navigate to='/login' />} />
        <Route path='/party' element={isAuthenticated ? <Layout user={authUser?.data?.userName}><PartyPage /></Layout> : <Navigate to='/login' />} />
        <Route path='/status' element={isAuthenticated ? <Layout user={authUser?.data?.userName}><StatusPage /></Layout> : <Navigate to='/login' />} />
        <Route path='/paymentStatus' element={isAuthenticated ? <Layout user={authUser?.data?.userName}><PaymentStatusPage /></Layout> : <Navigate to='/login' />} />
        <Route path='/rate' element={isAuthenticated ? <Layout user={authUser?.data?.userName}><RatePage /></Layout> : <Navigate to='/login' />} />
        <Route path='/form' element={isAuthenticated ? <Layout user={authUser?.data?.userName}><FormPage /></Layout> : <Navigate to='/login' />} />
        <Route path='/diamond-table' element={isAuthenticated ? <Layout onToggle={() => setShowTotal(!showTotal)} showTotal={showTotal} showIcon={showIcon} user={authUser?.data?.userName}><DiamondTable showIcon={() => setShowIcon(false)} showTotal={showTotal} /></Layout> : <Navigate to='/login' />} />
        <Route path='/record' element={isAuthenticated ? <Layout user={authUser?.data?.userName}><RecordPage /></Layout> : <Navigate to='/login' />} />
        <Route path='/employee' element={isAuthenticated ? <Layout user={authUser?.data?.userName}><EmployeePage /></Layout> : <Navigate to='/login' />} />
        <Route path='/employee-attendance' element={isAuthenticated ? <Layout user={authUser?.data?.userName}><AttendancePage /></Layout> : <Navigate to='/login' />} />


        <Route path='*' element={<PageNotFound />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App;