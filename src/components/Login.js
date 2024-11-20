import React, { useState, useRef } from 'react'
import {
    Box,
    Button,
    Center,
    Container,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    VStack,
    Text,
    useToast,
    Image,
    Flex,
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
    const [show, setShow] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const toast = useToast()
    const navigate = useNavigate()
    const toastIdRef = useRef()

    const handleClick = () => setShow(!show)

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email) {
            setEmailError('Email is required')
            return false
        }
        if (!re.test(email)) {
            setEmailError('Invalid email format')
            return false
        }
        setEmailError('')
        return true
    }

    const validatePassword = (password) => {
        if (!password) {
            setPasswordError('Password is required')
            return false
        }
        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters')
            return false
        }
        setPasswordError('')
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const isEmailValid = validateEmail(email)
        const isPasswordValid = validatePassword(password)

        if (isEmailValid && isPasswordValid) {
            toastIdRef.current = toast({
                title: "Login Attempt",
                description: "Attempting to log in...",
                status: "info",
                duration: null,
                isClosable: false,
            })

            try {
                const response = await fetch('http://localhost:3001/api/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                })

                if (toast.isActive(toastIdRef.current)) {
                    toast.close(toastIdRef.current)
                }
                if (response.ok) {
                    const data = await response.json()
                    localStorage.setItem("token", data.data.token)
                    localStorage.setItem("userId", data.data.userData._id);
                    toast({
                        title: "Login Successful",
                        description: "You have successfully logged in.",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    })
                    if (data.data.userData.userType === "admin") {
                        const otpResponse = await fetch('http://localhost:3001/api/auth/generate-otp', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email }),
                        })

                        if (otpResponse.ok) {
                            toast({
                                title: "OTP Sent",
                                description: "An OTP has been sent to your email for verification.",
                                status: "info",
                                duration: 3000,
                                isClosable: true,
                            })
                            navigate('/two-factor-auth', { state: { email } })
                        } else {
                            throw new Error('Failed to generate OTP')
                        }
                    } else {
                        navigate('/home')
                    }
                } else {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Login failed')
                }
            } catch (error) {
                toast({
                    title: "Login Failed",
                    description: error instanceof Error ? error.message : "An error occurred during login.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                })
            }
        } else {
            toast({
                title: "Invalid Input",
                description: "Please check your email and password.",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        }
    }

    return (
        <Flex
            minHeight="100vh"
            width="full"
            align="center"
            justifyContent="center"
            bgGradient="linear(to-br, #163343, #3eb599)"
        >
            <Container maxW="md" centerContent>
                <Box
                    bg="white"
                    p={8}
                    borderRadius="lg"
                    boxShadow="xl"
                    width="full"
                >
                    <VStack spacing={8} align="center">
                        <Image
                            src="/logo_main.png"
                            alt="Logo"
                            boxSize="150px"
                            objectFit="contain"
                        />
                        <Heading color="#163343">Login</Heading>
                        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                            <VStack spacing={4} align="flex-start">
                                <FormControl isInvalid={!!emailError}>
                                    <FormLabel htmlFor="email" color="#163343">Email</FormLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        borderColor="#163343"
                                        _hover={{ borderColor: "#3eb599" }}
                                        _focus={{ borderColor: "#3eb599", boxShadow: "0 0 0 1px #3eb599" }}
                                    />
                                    <FormErrorMessage>{emailError}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={!!passwordError}>
                                    <FormLabel htmlFor="password" color="#163343">Password</FormLabel>
                                    <InputGroup>
                                        <Input
                                            id="password"
                                            type={show ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            borderColor="#163343"
                                            _hover={{ borderColor: "#3eb599" }}
                                            _focus={{ borderColor: "#3eb599", boxShadow: "0 0 0 1px #3eb599" }}
                                        />
                                        <InputRightElement width="4.5rem">
                                            <Button h="1.75rem" size="sm" onClick={handleClick} bg="#163343" color="white" _hover={{ bg: "#3eb599" }}>
                                                {show ? 'Hide' : 'Show'}
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                    <FormErrorMessage>{passwordError}</FormErrorMessage>
                                </FormControl>
                                <Button type="submit" bg="#163343" color="white" width="full" mt={4} _hover={{ bg: "#3eb599" }}>
                                    Login
                                </Button>
                            </VStack>
                        </form>
                        <Flex direction="column" align="center" width="full">
                            <Text color="#163343">
                                Don't have an account?{' '}
                                <Link to="/register">
                                    <Text as="span" color="#3eb599" fontWeight="bold">
                                        Register here
                                    </Text>
                                </Link>
                            </Text>
                            <Link to="/forgot-password">
                                <Text color="#3eb599" fontWeight="bold" mt={2}>
                                    Forgot Password?
                                </Text>
                            </Link>
                        </Flex>
                    </VStack>
                </Box>
            </Container>
        </Flex>
    )
}

export default Login