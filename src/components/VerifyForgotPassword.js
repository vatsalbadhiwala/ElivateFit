import React, { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  useColorModeValue,
  FormErrorMessage,
} from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'

function VerifyForgotPassword() {
  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const { email } = useParams()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }


  const validateForm = () => {
    const newErrors = {}
    if (!formData.code) newErrors.code = 'Verification code is required'
    if (!formData.newPassword) newErrors.newPassword = 'New password is required'
    if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters long'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('http://54.86.232.234:3000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,  // Use the email from URL params
          code: formData.code,
          newPassword: formData.newPassword,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Password Reset Successful',
          description: 'Your password has been successfully reset. Please log in with your new password.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        navigate('/login')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error.message || 'Failed to reset password')
      }
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: error.message || 'Unable to reset password. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="lg" py={12}>
      <Box
        bg={useColorModeValue('white', 'gray.700')}
        p={8}
        borderRadius="lg"
        boxShadow="lg"
      >
        <VStack spacing={6}>
          <Heading as="h1" size="xl">
            Reset Password
          </Heading>
          <Text>Enter the verification code sent to {email} along with your new password.</Text>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <FormControl id="code" isRequired isInvalid={!!errors.code} mb={4}>
              <FormLabel>Verification Code</FormLabel>
              <Input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Enter verification code"
              />
              <FormErrorMessage>{errors.code}</FormErrorMessage>
            </FormControl>
            <FormControl id="newPassword" isRequired isInvalid={!!errors.newPassword} mb={4}>
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
              />
              <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
            </FormControl>
            <FormControl id="confirmPassword" isRequired isInvalid={!!errors.confirmPassword} mb={4}>
              <FormLabel>Confirm New Password</FormLabel>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            </FormControl>
            <Button
              mt={4}
              colorScheme="blue"
              isLoading={isLoading}
              type="submit"
              width="full"
            >
              Reset Password
            </Button>
          </form>
        </VStack>
      </Box>
    </Container>
  )
}

export default VerifyForgotPassword