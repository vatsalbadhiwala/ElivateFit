import React, { useEffect, useState } from 'react'
import {
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Flex,
  Text,
  useToast,
  Box,
} from '@chakra-ui/react'
import { ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'

export default function ProfileMenu() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const toast = useToast()

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      setUser(JSON.parse(storedUserData))
    } else {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const decodedToken = jwtDecode(token)
          fetchUserData(decodedToken._id, token)
        } catch (error) {
          console.error('Error decoding token:', error)
          toast({
            title: "Authentication Error",
            description: "Please log in again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          })
          navigate('/login')
        }
      } else {
        navigate('/login')
      }
    }
  }, [navigate, toast])

  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`http://54.86.232.234:3000/api/user/getUserById/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      setUser(data.data)
      localStorage.setItem('userData', JSON.stringify(data.data))
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch user data. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const onSignOutClick = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userData")
    navigate('/login')
    toast({
      title: "Signed Out",
      description: "You have been successfully logged out.",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  const onProfileClick = () => {
    navigate('/profile')
  }

  if (!user) {
    return null // or a loading spinner
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDown size={16} />}
        bg="#3eb599"
        color="white"
        _hover={{ bg: '#35a086' }}
        _active={{ bg: '#2e8b72' }}
        size="sm"
        fontWeight="medium"
      >
        <Flex alignItems="center" gap={2}>
          <Avatar 
            name={`${user.firstName} ${user.lastName}`} 
            size="xs"
            bg="#163343"
            color="white"
          />
        </Flex>
      </MenuButton>
      <MenuList bg="white" borderColor="#e2e8f0" boxShadow="md">
        <MenuItem 
          icon={<User size={16} color="#163343" />} 
          onClick={onProfileClick}
          _hover={{ bg: '#3eb599' }}
          _focus={{ bg: '#3eb599' }}
        >
          <Text color="#163343">Profile</Text>
        </MenuItem>
        <MenuDivider borderColor="#e2e8f0" />
        <MenuItem 
          icon={<LogOut size={16} color="#163343" />} 
          onClick={onSignOutClick}
          _hover={{ bg: '#3eb599' }}
          _focus={{ bg: '#3eb599' }}
        >
          <Text color="#163343">Sign out</Text>
        </MenuItem>
      </MenuList>
    </Menu>
  )
}