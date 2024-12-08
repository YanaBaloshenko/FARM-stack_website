import { useState, useEffect } from 'react';

import { createBrowserRouter, Route, createRoutesFromElements, RouterProvider } from 'react-router-dom'

import RootLayout from "./layouts/RootLayout"
import UserPage from "./pages/UserPage";
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import RegistrationPage from './pages/Registration';
import { AuthProvider } from "./contexts/AuthContext"


// ################################ App ################################

// creating the router
const router = createBrowserRouter(
  // invoking the function that creates the actual routes
  createRoutesFromElements(
    // routes correspond and map a component
    <Route path="/" element={<RootLayout />}>
      {/* <Route element={<AuthRequired />}> ... </Route> */} {/* protecting a page */} 
      <Route path="/user" element={<UserPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="register" element={<RegistrationPage />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
