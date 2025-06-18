import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import Welcome from '../components/Welcome';
import '../../css/dashboard.css';
import { LogOut,reset } from '../features/auth_slice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import DashboardComp from '../components/dashboard_components/dashboard_comp';
import Navbar from '../components/navbar';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(LogOut()).then(() => {
        navigate("/"); // ✅ Redirect after logout
    });
  };
  return (
    <>
    <Navbar/>
    {/* <Layout>
        <Button onClick={handleLogout}>LOG OUT</Button>
        <Welcome />
    </Layout> */}
    <Layout>
      <DashboardComp/>
    </Layout>
    </>
  );
  
};

export default Dashboard;
