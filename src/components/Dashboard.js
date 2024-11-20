import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Container,
    VStack,
    Text,
    Button,
    Select,
} from '@chakra-ui/react';
import { AgCharts } from 'ag-charts-react';
import { jwtDecode } from 'jwt-decode';

function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [macroNutrients, setMacroNutrients] = useState([]);
    const [historicalMacros, setHistoricalMacros] = useState([]);
    const [exerciseLogs, setExerciseLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [unit, setUnit] = useState({ height: 'cm', weight: 'kg' });

    const itemsPerPage = 10;

    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    const userId = decodedToken._id;
    const today = new Date().toISOString().split('T')[0];

    const [dailyChartOptions, setDailyChartOptions] = useState({
        autoSize: true,
        title: { text: "Daily Macronutrient Distribution" },
        data: [],
        series: [
            {
                type: "pie",
                angleKey: "value",
                calloutLabelKey: "name",
                sectorLabelKey: "value",
                fills: [
                    'rgba(54, 162, 235, 0.6)', // Protein
                    'rgba(255, 206, 86, 0.6)', // Carbs
                    'rgba(255, 99, 132, 0.6)', // Fats
                ],
                strokes: [
                    'rgba(54, 162, 235, 1)', // Protein
                    'rgba(255, 206, 86, 1)', // Carbs
                    'rgba(255, 99, 132, 1)', // Fats
                ],
            },
        ],
    });

    const convertUnits = (value, fromUnit, toUnit) => {
        if (fromUnit === "cm" && toUnit === "ft") {
            const totalInches = parseFloat(value) / 2.54;
            const feet = Math.floor(totalInches / 12);
            const inches = Math.round(totalInches % 12);
            return `${feet}ft ${inches}in`;
        } else if (fromUnit === "ft" && toUnit === "cm") {
            return (parseFloat(value) * 30.48).toFixed(2);
        } else if (fromUnit === "kg" && toUnit === "lbs") {
            return (parseFloat(value) * 2.20462).toFixed(2);
        } else if (fromUnit === "lbs" && toUnit === "kg") {
            return (parseFloat(value) / 2.20462).toFixed(2);
        }
        return value;
    };

    const handleUnitChange = (type, newUnit) => {
        setUnit((prevUnit) => ({ ...prevUnit, [type]: newUnit }));
    };

    const [historicalChartOptions, setHistoricalChartOptions] = useState({
        autoSize: true,
        title: { text: "Macronutrients Over Time" },
        data: [],
        series: [
            {
                type: "line",
                xKey: "date",
                yKey: "protein",
                stroke: 'rgba(54, 162, 235, 1)', // Protein
                marker: { fill: 'rgba(54, 162, 235, 0.6)', stroke: 'rgba(54, 162, 235, 1)' },
                title: "Protein",
                smooth: true, // Smooths the data points for Protein
            },
            {
                type: "line",
                xKey: "date",
                yKey: "carbs",
                stroke: 'rgba(255, 206, 86, 1)', // Carbs
                marker: { fill: 'rgba(255, 206, 86, 0.6)', stroke: 'rgba(255, 206, 86, 1)' },
                title: "Carbs",
                smooth: true, // Smooths the data points for Carbs
            },
            {
                type: "line",
                xKey: "date",
                yKey: "fats",
                stroke: 'rgba(255, 99, 132, 1)', // Fats
                marker: { fill: 'rgba(255, 99, 132, 0.6)', stroke: 'rgba(255, 99, 132, 1)' },
                title: "Fats",
                smooth: true, // Smooths the data points for Fats
            },
        ],
        axes: [
            { type: "time", position: "bottom", title: { text: "Date" } },
            { type: "number", position: "left", title: { text: "Grams" } },
        ],
        legend: {
            position: "bottom", // Adds a legend below the chart
            enabled: true, // Ensures the legend is displayed
        },
        tooltip: {
            enabled: true, // Enables tooltips
            renderer: (params) => ({
                content: `<b>${params.title}</b><br> ${params.yValue}`,
            }),
        },
    });

    useEffect(() => {
        fetchProfile();
        fetchDailyMacros();
        fetchHistoricalMacros();
        fetchExerciseLogs();
    }, [currentPage]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`http://54.86.232.234:3000/api/user/getUserById/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (response.ok) {
                setProfile(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            setProfile({
                firstName: "John",
                lastName: "Doe",
                sex: "Male",
                age: 28,
                height: 175,
                weight: 70,
                fitnessGoal: "Build muscle",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchExerciseLogs = async () => {
        try {
            const response = await fetch(`http://54.86.232.234:3000/api/user/get-exercise-logs/${userId}?date=${today}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (response.ok) {
                setExerciseLogs(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error("Error fetching exercise logs:", error.message);
            setExerciseLogs([
                { activity: 'Cardio', minutes: 30, calories: 300 },
                { activity: 'Strength Training', minutes: 45, calories: 400 },
                { activity: 'Stretching', minutes: 60, calories: 200 },
            ]);
        }
    };

    const fetchDailyMacros = async () => {
        try {
            const response = await fetch(`http://54.86.232.234:3000/api/meal/get-meals/${userId}?date=${today}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch macro nutrients')
            }

            const result = await response.json();
            if (Array.isArray(result.data) && result.data.length > 0) {
                // Sum up all nutrient values
                const totalNutrients = result.data.reduce((acc, meal) => {
                    if (meal.nutrients) {
                        acc.protein += meal.nutrients.protein || 0
                        acc.fat += meal.nutrients.fat || 0
                        acc.carbohydrates += meal.nutrients.carbohydrates || 0
                    }
                    return acc
                }, { protein: 0, fat: 0, carbohydrates: 0 })

                const macrosData = [
                    { name: 'Protein', value: totalNutrients.protein },
                    { name: 'Fat', value: totalNutrients.fat },
                    { name: 'Carbohydrates', value: totalNutrients.carbohydrates },
                ]

                setMacroNutrients(macrosData)
                setDailyChartOptions((prevOptions) => ({
                    ...prevOptions,
                    data: macrosData,
                }))
            } else {
                throw new Error('No meal data found')
            }
        } catch (error) {
            console.error("Error fetching daily macronutrients:", error);
        }
    };

    const fetchHistoricalMacros = async () => {
        try {
            const response = await fetch(
                `http://54.86.232.234:3000/api/meal/get-all-meals/${userId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error('Failed to fetch historical macronutrients')
            }

            const result = await response.json();            
            if (Array.isArray(result.data)) {
                const processedData = processHistoricalData(result.data)
                setHistoricalMacros(processedData)
                setHistoricalChartOptions((prevOptions) => ({
                    ...prevOptions,
                    data: processedData.sort((a, b) => a.date - b.date),
                }))
            } else {
                throw new Error('Invalid data format received')
            }
        } catch (error) {
            console.error("Error fetching historical macronutrients:", error);
        }
    };


    const processHistoricalData = (data) => {
        const groupedByDate = data.reduce((acc, meal) => {
            const date = new Date(meal.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
            if (!acc[date]) {
                acc[date] = []
            }
            acc[date].push(meal.nutrients)
            return acc
        }, {})
        return Object.entries(groupedByDate).map(([date, nutrients]) => {
            const totalNutrients = nutrients.reduce((sum, nutrient) => ({
                protein: sum.protein + nutrient.protein,
                fat: sum.fat + nutrient.fat,
                carbohydrates: sum.carbohydrates + nutrient.carbohydrates,
            }), { protein: 0, fat: 0, carbohydrates: 0 })
            return {
                date: new Date(date),
                protein: totalNutrients.protein,
                fats: totalNutrients.fat,
                carbs: totalNutrients.carbohydrates
            }
        })
    }

    return (
        <Box>
            <Container maxW="container.xl" py={5}>
                <VStack spacing={6}>
                    {/* Profile Section */}
                    <Box bg="white" p={6} borderRadius="md" boxShadow="md" w="full">
                        <Heading as="h2" size="lg" mb={4}>
                            Profile
                        </Heading>
                        {loading ? (
                            <Text>Loading profile...</Text>
                        ) : (
                            profile && (
                                <VStack align="start" spacing={2}>
                                    <Text><strong>First Name:</strong> {profile.firstName}</Text>
                                    <Text><strong>Last Name:</strong> {profile.lastName}</Text>
                                    <Text><strong>Sex:</strong> {profile.sex}</Text>
                                    <Text><strong>Age:</strong> {profile.age}</Text>
                                    <Text>
                                        <strong>Height:</strong>{" "}
                                        {unit.height === "cm"
                                            ? `${profile.height} cm`
                                            : convertUnits(profile.height, "cm", "ft")}
                                    </Text>
                                    <Select
                                        value={unit.height}
                                        onChange={(e) => handleUnitChange("height", e.target.value)}
                                        size="sm"
                                        w="fit-content"
                                        mt={2}
                                    >
                                        <option value="cm">Centimeters</option>
                                        <option value="ft">Feet/Inches</option>
                                    </Select>
                                    <Text>
                                        <strong>Weight:</strong>{" "}
                                        {unit.weight === "kg"
                                            ? `${profile.weight} kg`
                                            : convertUnits(profile.weight, "kg", "lbs")}
                                    </Text>
                                    <Select
                                        value={unit.weight}
                                        onChange={(e) => handleUnitChange("weight", e.target.value)}
                                        size="sm"
                                        w="fit-content"
                                        mt={2}
                                    >
                                        <option value="kg">Kilograms</option>
                                        <option value="lbs">Pounds</option>
                                    </Select>
                                    <Text><strong>Fitness Goal:</strong> {profile.goal}</Text>
                                </VStack>
                            )
                        )}
                    </Box>


                    {/* Exercise Log Section */}
                    <Box bg="white" p={6} borderRadius="md" boxShadow="md" w="full">
                        <Heading as="h2" size="lg" mb={4}>
                            Exercise Log
                        </Heading>
                        <Table variant="striped" colorScheme="teal">
                            <Thead>
                                <Tr>
                                    <Th>Activity</Th>
                                    <Th>Minutes</Th>
                                    <Th>Calories</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {exerciseLogs.map((log, index) => (
                                    <Tr key={index}>
                                        <Td>{log.activity}</Td>
                                        <Td>{log.minutes}</Td>
                                        <Td>{log.calories}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>

                    {/* Daily Macronutrient Pie Chart */}
                    <Box bg="white" p={6} borderRadius="md" boxShadow="md" w="full">
                        <Heading as="h2" size="lg" mb={4}>
                            Today's Macronutrient Distribution
                        </Heading>
                        <Box width="100%" maxWidth="auto" margin="0 auto">
                            <AgCharts options={dailyChartOptions} />
                        </Box>
                    </Box>

                    {/* Historical Macronutrient Line Chart */}
                    <Box bg="white" p={6} borderRadius="md" boxShadow="md" w="full">
                        <Heading as="h2" size="lg" mb={4}>
                            Macronutrients Over Time
                        </Heading>
                        <Box width="100%" maxWidth="auto" margin="0 auto">
                            <AgCharts options={historicalChartOptions} />
                        </Box>
                    </Box>

                </VStack>
            </Container>
        </Box>
    );
}

export default Dashboard;