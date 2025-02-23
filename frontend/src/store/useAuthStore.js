import {create} from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const useAuthStore = create((set,get)=>({
    authUser: null,
    isSigningUp: false,
    isLoggingIn : false,
    isUpdatingProfile:false,
    isCheckingAuth: true,
    onlineUsers:[],
    socket:null,
  

    checkAuth: async() =>{
        try {
            const res = await axiosInstance.get(`${BASE_URL}/auth/check`);
            set({authUser: res.data});
            get().connectSocket();
            
        } catch (error) {
            set({authUser: null});
            console.log("error in checkAuth",error);
            
        }
        finally{
            set({isCheckingAuth: false});
        }

    },
    signUp: async(data) =>{
        set({isSigningUp: true});
        console.log("is signing up");
        try {
            const res= await axiosInstance.post(`${BASE_URL}/auth/signup`,data);
            set({authUser: res.data});
            toast.success("Account created successfully");
            get().connectSocket();

            
            
        } catch (error) {
            console.log("this is error",error.message);
            toast.error(error.res.data.message);
            
        }
        finally{
            set({isSigningUp: false});
        }
        
    },

    login:async(data) =>{
        set({isLoggingIn: true});
        try {
            const res = await axiosInstance.post(`${BASE_URL}/auth/login`,data);
            set({authUser: res.data});
            toast.success("Logged in successfully");
            get().connectSocket()

            
        } catch (error) {
            toast.error(error.response.data.message);
            
        } finally{
            set({isLoggingIn: false});
        }

    },
    logout: async()=>{
        try {
            await axiosInstance.post(`${BASE_URL}/auth/logout`);
            set({authUser: null});
            toast.success("Logged out successfully");
            get().disconnectSocket();

            
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    updateProfile: async (data) => {
        set({isUpdatingProfile: true});
        try {
            const res = await axiosInstance.put(`${BASE_URL}/auth/update-profile`,data);
            set({authUser: res.data});

            toast.success("Profile updated successfully");
            
        } catch (error) {
            console.log("error in update profile:",error);
            toast.error(error.response.data.message);
            
        } finally{
            set({isUpdatingProfile:false});
        }
        
    },
    connectSocket:() =>{
        const {authUser} = get();
        if(!authUser ||get().socket?.connected) return;
        const socket = io("http://localhost:5001",{
            query:{
                userId:authUser._id
            }
        });
        socket.connect();
        set({socket:socket});

        socket.on("getOnlineUsers",(userIds)=>{
            set({onlineUsers:userIds});
            console.log("hello, connected to server");
        })

    },
    disconnectSocket:() =>{
        if(get().socket?.connected) get().socket.disconnect();
    }
}));
