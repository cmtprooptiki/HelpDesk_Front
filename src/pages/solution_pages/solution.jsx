import React ,{useEffect} from 'react'
import Layout from '../Layout'
import CategoryList from '../../components/category_components/CategoryList.jsx'
import { useDispatch,useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../../features/auth_slice.jsx'
import Navbar from '../../components/navbar.jsx'
import SolutionList from '../../components/solution_components/SolutionList.jsx'

const Solution = () => {
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
        <SolutionList/>
    </Layout>
    </>
  )
}

export default Solution