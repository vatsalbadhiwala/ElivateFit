import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  PinInput,
  PinInputField,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'

function TwoFactorAuth() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email || ''

  useEffect(() => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email not provided. Please try logging in again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      navigate('/login')
    }
  }, [email, navigate, toast])

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timerId)
    }
  }, [timeLeft])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: code }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Authentication successful",
          description: "You have been successfully authenticated.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
        navigate('/admin-home')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Authentication failed')
      }
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "The code you entered is incorrect. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setTimeLeft(30)
    try {
      const response = await fetch('http://localhost:3001/api/auth/generate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast({
          title: "Code resent",
          description: "A new authentication code has been sent to your device.",
          status: "info",
          duration: 5000,
          isClosable: true,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to resend code')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend code. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
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
            Two-Factor Authentication
          </Heading>
          <Text>Enter the 6-digit code sent to your device.</Text>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <FormControl id="2fa-code" isRequired>
              <FormLabel>Authentication Code</FormLabel>
              <HStack justifyContent="center">
                <PinInput
                  otp
                  size="lg"
                  value={code}
                  onChange={(value) => setCode(value)}
                >
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                </PinInput>
              </HStack>
            </FormControl>
            <Button
              mt={4}
              colorScheme="blue"
              isLoading={isLoading}
              type="submit"
              width="full"
              isDisabled={code.length !== 6}
            >
              Verify
            </Button>
          </form>
          <Text>
            Didn't receive a code?{' '}
            <Button
              variant="link"
              colorScheme="blue"
              onClick={handleResendCode}
              isDisabled={timeLeft > 0}
            >
              Resend
            </Button>
            {timeLeft > 0 && ` (${timeLeft}s)`}
          </Text>
        </VStack>
      </Box>
    </Container>
  )
}

export default TwoFactorAuth