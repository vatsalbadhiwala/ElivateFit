import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Icon,
  HStack,
  Badge,
} from '@chakra-ui/react'
import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiActivity,
  FiLock,
  FiEdit3
} from 'react-icons/fi'
import { MdStraighten } from 'react-icons/md'
import { useParams } from 'react-router-dom'
import NavBar from '../NavBar'

function UserActivity() {
  const [userData, setUserData] = useState(null)
  const [newEmail, setNewEmail] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const userId = useParams();
  const toast = useToast()
  const token = localStorage.getItem('token')

  console.log(userId);
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Replace 'user_id' with the actual user ID or fetch it from context/props
      const response = await fetch(`http://localhost:3001/api/user/getUserById/${userId.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      const data = await response.json()
      setUserData(data.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleEmailUpdate = async () => {
    try {
      // Replace 'user_id' with the actual user ID
      const response = await fetch(`http://localhost:3001/api/user/updateUserEmail/${userId.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail }),
      })
      if (!response.ok) {
        throw new Error('Failed to update email')
      }
      toast({
        title: 'Success',
        description: 'Email updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      fetchUserData() // Refresh user data
      setNewEmail('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update email',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handlePasswordReset = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/admin-reset-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldEmail: userData.email, newEmail: resetEmail }),
      })
      if (!response.ok) {
        throw new Error('Failed to send password reset email')
      }
      toast({
        title: 'Success',
        description: 'Password reset email sent',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      setResetEmail('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send password reset email',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (!userData) {
    return <Text>Loading...</Text>
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <NavBar />
      <Container maxW="container.lg" py={8}>
        <Stack spacing={8}>
          {/* User Overview Card */}
          <Card>
            <CardHeader bg="blue.500" color="white" borderTopRadius="md">
              <HStack>
                <Icon as={FiUser} boxSize={6} />
                <Heading size="md">User Profile</Heading>
                <Badge ml="auto" colorScheme="green">{userData.userType}</Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                  <Stack spacing={4}>
                    <HStack>
                      <Icon as={FiUser} color="blue.500" />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Full Name</Text>
                        <Text>{userData.firstName} {userData.lastName}</Text>
                      </Box>
                    </HStack>
                    <HStack>
                      <Icon as={FiMail} color="blue.500" />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Email</Text>
                        <Text>{userData.email}</Text>
                      </Box>
                    </HStack>
                    <HStack>
                      <Icon as={FiCalendar} color="blue.500" />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Date of Birth</Text>
                        <Text>{userData.dateOfBirth} (Age: {userData.age})</Text>
                      </Box>
                    </HStack>
                  </Stack>
                </GridItem>
                <GridItem>
                  <Stack spacing={4}>
                    <HStack>
                      <Icon as={MdStraighten} color="blue.500" />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Height</Text>
                        <Text>{userData.height} {userData.heightUnit}</Text>
                      </Box>
                    </HStack>
                    <HStack>
                      <Icon as={FiActivity} color="blue.500" />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Weight</Text>
                        <Text>{userData.weight} {userData.weightUnit}</Text>
                      </Box>
                    </HStack>
                    <HStack>
                      <Icon as={FiCalendar} color="blue.500" />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Member Since</Text>
                        <Text>{new Date(userData.createdAt).toLocaleDateString()}</Text>
                      </Box>
                    </HStack>
                  </Stack>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Admin Controls */}
          {/* {userData.userType === 'admin' && ( */}
            <Card>
              <CardHeader bg="purple.500" color="white" borderTopRadius="md">
                <HStack>
                  <Icon as={FiEdit3} boxSize={6} />
                  <Heading size="md">Admin Controls</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <FormControl>
                  <FormLabel>Update User Email</FormLabel>
                  <HStack>
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email"
                    />
                    <Button colorScheme="purple" onClick={handleEmailUpdate}>
                      Update Email
                    </Button>
                  </HStack>
                </FormControl>
              </CardBody>
            </Card>
          {/* )} */}

          {/* Password Reset Card */}
          <Card>
            <CardHeader bg="teal.500" color="white" borderTopRadius="md">
              <HStack>
                <Icon as={FiLock} boxSize={6} />
                <Heading size="md">Security Settings</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <FormControl>
                <FormLabel>Reset Password</FormLabel>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  Enter your email address to receive password reset instructions
                </Text>
                <HStack>
                  <Input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Confirm your email"
                  />
                  <Button colorScheme="teal" onClick={handlePasswordReset}>
                    Send Reset Link
                  </Button>
                </HStack>
              </FormControl>
            </CardBody>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}

export default UserActivity