'use client'

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
  Flex,
  Image,
  Link,
  ChakraProvider,
  extendTheme,
} from '@chakra-ui/react'
import { ArrowLeft, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const theme = extendTheme({
  colors: {
    primary: {
      500: '#163343',
      600: '#122736',
    },
    secondary: {
      500: '#3eb599',
      600: '#35a087',
    },
  },
})

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
      try {
        const response = await fetch('http://54.86.232.234:3000/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })

        if (!response.ok) {
          throw new Error('Failed to send the password')
        }
        toast({
          title: "Reset link sent",
          description: "If an account exists with this email, you will receive a password reset link.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
        setEmail('')
        navigate('/login')
      } catch (error) {
        toast({
          title: "An error occurred",
          description: "Unable to send reset link. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

  return (
      <ChakraProvider theme={theme}>
        <Flex minHeight="100vh" width="full" align="center" justifyContent="center" bgGradient="linear(to-br, #163343, #3eb599)">
          <Container maxW="md" py={12}>
            <Box bg="white" p={8} borderRadius="lg" boxShadow="xl">
              <VStack spacing={6} align="stretch">
                {/* <Image src="/placeholder.svg?height=60&width=60" alt="Logo" mx="auto" /> */}
                <Heading as="h1" size="xl" textAlign="center" color="primary.500">
                  Forgot Password
                </Heading>
                <Text textAlign="center" color="gray.600">
                  Enter your email address to receive a password reset link.
                </Text>
                <form onSubmit={handleSubmit}>
                  <FormControl id="email" isRequired>
                    <FormLabel color="gray.700">Email address</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      size="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'secondary.500' }}
                      _focus={{ borderColor: 'secondary.500', boxShadow: '0 0 0 1px #3eb599' }}
                    />
                  </FormControl>
                  <Button
                    mt={6}
                    bg="secondary.500"
                    color="white"
                    isLoading={isLoading}
                    type="submit"
                    width="full"
                    size="lg"
                    _hover={{ bg: 'secondary.600' }}
                    _active={{ bg: 'secondary.600' }}
                    leftIcon={<Send size={20} />}
                  >
                    Send Reset Link
                  </Button>
                </form>
                <Flex justify="center" mt={4}>
                  <Link
                    href="/login"
                    color="secondary.500"
                    fontWeight="medium"
                    fontSize="sm"
                    _hover={{ color: 'secondary.600' }}
                    style={{
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
                    Back to Login
                  </Link>
                </Flex>
              </VStack>
            </Box>
          </Container>
        </Flex>
      </ChakraProvider>
    )
  
}
  export default ForgotPassword