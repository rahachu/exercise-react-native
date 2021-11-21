import * as React from 'react'

export const AuthContext = React.createContext()

export const User = {
    id: 0,
    name: 'String',
    email: 'string',
    admin: false,
    profile_photo_url: 'https://i.pinimg.com/originals/03/8c/ba/038cba46d5d9fa20bd71aefba52b773a.jpg',
    token: '',
    email_verified_at: '',
}