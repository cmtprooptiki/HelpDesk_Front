import React ,{useEffect} from 'react'
import Layout from '../Layout'
import OrganizationList from '../../components/organization_components/OrganizationList.jsx'
import { useDispatch,useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../../features/auth_slice.jsx'
import Navbar from '../../components/navbar.jsx'

const Organization = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {isError,user} = useSelector((state=>state.auth));

  // useEffect(()=>{
  //     dispatch(getMe());
  // },[dispatch]);

  // useEffect(()=>{
  //     if(isError){
  //         //navigate("/");
  //         console.log(isError)
  //     }
  //     if(user && user.role !=="admin"){
  //       //navigate("/dashboard");
  //       console.log(user)

  //     }
  // },[isError,user,navigate]);
  return (
    <>
    {/* <Navbar/> */}
    <Layout>
        <OrganizationList/>
    </Layout>
    </>
  )
}

export default Organization