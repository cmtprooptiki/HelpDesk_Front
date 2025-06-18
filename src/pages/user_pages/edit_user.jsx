import React,{useEffect} from 'react'
import Layout from '../Layout'
import FormEditUser from '../../components/user_components/FormEditUser'
import { useDispatch,useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../../features/auth_slice.jsx'

const EditUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {isError,user} = useSelector((state=>state.auth));

  // useEffect(()=>{
  //     dispatch(getMe());
  // },[dispatch]);

  // useEffect(()=>{
  //     if(isError){
  //         navigate("/");
  //     }
  //     if(user && user.role !=="admin"){
  //       navigate("/dashboard");
  //     }
  // },[isError,user,navigate]);
  return (
    <Layout>
        <FormEditUser/>
    </Layout>
  )
}

export default EditUser