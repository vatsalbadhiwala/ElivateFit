import React from 'react'
import { Box, VStack, Heading, Text, Button, Container } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import NavBar from './NavBar'
import Dashboard from './Dashboard'

function Home({ onLogout }) {
    // const navigate = useNavigate()

    // const handleLogout = () => {
    //     // onLogout()
    //     localStorage.removeItem("token");
    //     navigate('/login')
    // }

    return (
        <Box width="100%">
            <NavBar />
            <Container maxW="container.xl" centerContent>
                <Box margin="auto" mt={8} p={4}>
                    <VStack spacing={4}>
                        {/* <Heading>Welcome to the Home Page</Heading>
                        <Text>You are now logged in.</Text>
                        <Button onClick={handleLogout} colorScheme="red">Logout</Button> */}
                    </VStack>
                </Box>
                <Dashboard />
            </Container>
        </Box>
    )
}

export default Home