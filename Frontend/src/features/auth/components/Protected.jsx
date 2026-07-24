import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'

const Protected = ({ children, role }) => {

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center font-label-md uppercase tracking-widest">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" />
    }

    if (role && user.role !== role) {
        return <Navigate to="/" />
    }

    return children

}

export default Protected