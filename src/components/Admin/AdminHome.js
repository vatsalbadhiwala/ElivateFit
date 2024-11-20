import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Container,
  useColorModeValue,
  Button,
  useToast,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { FiTrendingUp, FiTrendingDown, FiUsers, FiDollarSign, FiActivity, FiEye, FiTrash2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { AgCharts } from 'ag-charts-react'
import NavBar from '../NavBar'

function StatCard({ title, stat, helpText, type, icon }) {
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={'5'}
      shadow={'xl'}
      border={'1px solid'}
      borderColor={useColorModeValue('gray.800', 'gray.500')}
      rounded={'lg'}
    >
      <Flex justifyContent="space-between">
        <Box>
          <StatLabel fontWeight={'medium'} isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
            {stat}
          </StatNumber>
        </Box>
        <Box>
          <Icon as={icon} w={8} h={8} color={useColorModeValue('gray.800', 'gray.200')} />
        </Box>
      </Flex>
      <StatHelpText>
        {type === 'increase' ? (
          <Icon as={FiTrendingUp} color="green.500" />
        ) : (
          <Icon as={FiTrendingDown} color="red.500" />
        )}{' '}
        {helpText}
      </StatHelpText>
    </Stat>
  )
}

function AdminHome() {
  const [userData, setUserData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [goalData, setGoalData] = useState([])
  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('http://54.86.232.234:3000/api/user/get-user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      setUserData(data.data)
      setIsLoading(false)

      // Calculate goal data for chart
      const goals = data.data.reduce((acc, user) => {
        acc[user.goal] = (acc[user.goal] || 0) + 1
        return acc
      }, {})
      setGoalData(Object.entries(goals).map(([goal, count]) => ({ goal, count })))
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch user data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setIsLoading(false)
    }
  }

  const onViewClick = (userId) => {
    navigate(`/user-activity/${userId}`)
  }

  const onDeleteClick = async (userId) => {
    try {
      console.log(userId);
      const token = localStorage.getItem('token')
      const response = await fetch(`http://54.86.232.234:3000/api/user/deleteUserById/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      toast({
        title: 'Success',
        description: 'User deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      fetchUserData() // Refresh user data
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const chartOptions = {
    title: {
      text: 'User Goals Distribution',
    },
    data: goalData,
    series: [
    {
      type: "bar",
      xKey: "goal",
      yKey: "count",
      yName: "User Count",
      cornerRadius: 10,
    }],
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <NavBar />
      <Container maxW="container.xl" py={5}>
        <Heading as="h1" size="xl" mb={6} color={textColor}>
          Admin Dashboard
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 5, lg: 8 }}>
          <StatCard
            title={'Total Users'}
            stat={userData.length}
            helpText={'Total registered users'}
            type={'increase'}
            icon={FiUsers}
          />
          <StatCard
            title={'Active Goals'}
            stat={goalData.length}
            helpText={'User fitness goals'}
            type={'increase'}
            icon={FiActivity}
          />
        </SimpleGrid>

        <Box
          mt={8}
          bg={useColorModeValue('white', 'gray.700')}
          shadow="base"
          rounded="lg"
          p={5}
        >
          <Heading as="h2" size="lg" mb={4}>
            User Goals Distribution
          </Heading>
          <Box height="400px">
            <AgCharts options={chartOptions} />
          </Box>
        </Box>

        <Box
          mt={8}
          bg={useColorModeValue('white', 'gray.700')}
          shadow="base"
          rounded="lg"
          p={5}
        >
          <Heading as="h2" size="lg" mb={4}>
            User Data
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Age</Th>
                <Th>Height</Th>
                <Th>Weight</Th>
                <Th>Goal</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={7}>Loading...</Td>
                </Tr>
              ) : (
                userData.map((user) => (
                  <Tr key={user._id}>
                    <Td>{`${user.firstName} ${user.lastName}`}</Td>
                    <Td>{user.email}</Td>
                    <Td>{user.age}</Td>
                    <Td>{`${user.height} ${user.heightUnit}`}</Td>
                    <Td>{`${user.weight} ${user.weightUnit}`}</Td>
                    <Td>{user.goal}</Td>
                    <Td>
                      <Flex>
                        <Button
                          leftIcon={<Icon as={FiEye} />}
                          colorScheme="blue"
                          size="sm"
                          mr={2}
                          onClick={() => onViewClick(user._id)}
                        >
                          View
                        </Button>
                        <Button
                          leftIcon={<Icon as={FiTrash2} />}
                          colorScheme="red"
                          size="sm"
                          onClick={() => onDeleteClick(user._id)}
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Container>
    </Box>
  )
}

export default AdminHome