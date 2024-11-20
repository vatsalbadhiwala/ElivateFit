import React, {useState, useEffect} from 'react'

import {
    Box,
    Button,
    Center,
    FormControl,
    Heading,
    Input,
    InputGroup,
    VStack,
    Text,
    useToast,
    Stack,
    Drawer, 
    DrawerBody, 
    DrawerFooter, 
    DrawerHeader, 
    DrawerOverlay, 
    DrawerContent, 
    useDisclosure,
    List,
    ListItem,
    Progress,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    StatHelpText,
    Stat,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormLabel,
    HStack
  } from '@chakra-ui/react'

import NavBar from '../NavBar'
const appId = '6fe5132c';
const appKey = '635f181a08b732a384c456a90d2b45f5';
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');


const ITEMS_PER_PAGE = 8;


//for progress bar
const calorieGoal = 2000; // Set a calorie goal

// handle items with 0 calories
const maxServings = 30;

let user;

async function fetchUser() {
  try {
    const response = await fetch(`http://54.86.232.234:3000/api/user/getUserById/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    if (response.ok) {
        return result.data;  
    } else {
        throw new Error(result.message);
    }
    
  } catch (error) {
      console.error("Error fetching meals:", error.message);
  }
}
(async () => {
  user = await fetchUser();
})();

const NutritionForm = () => {

  const [query, setQuery] = useState('');  // Storing the search input
  const [foodData, setFoodData] = useState([]);  // API response data
  const toast = useToast(); // Error message pop ups
  
  const [currentPage, setCurrentPage] = useState(1); // Used for food data
  
  const { isOpen, onOpen, onClose } = useDisclosure(); // handle open or close state for drawer
  const [selectedItem, setSelectedItem] = useState(null); // Clicked food to add 
 
  // adding to sections 
  const [breakfastItems, setBreakfastItems] = useState([]);
  const [lunchItems, setLunchItems] = useState([]);
  const [dinnerItems, setDinnerItems] = useState([]);
  const [snackItems, setSnackItems] = useState([]);

  // selection of quantity when drawer is open
  const [quantity, setQuantity] = useState(1);

  //meals pulled from account
  const [meals, setMeals] = useState([]);

  //dealing with date changing
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const formatDate = (date) => date.toISOString().split('T')[0];
  const adjustDate = (days) => {
    setCurrentDate((prevDate) => {
      const selectedDate = new Date(prevDate); 
      const createdAtDate = new Date(user.createdAt);
  
      if (selectedDate < createdAtDate) {
        selectedDate.setTime(createdAtDate.getTime()); 
        toast({
          title: `Dates cannot be before account creation (${formatDate(createdAtDate)}).`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        selectedDate.setDate(selectedDate.getDate() + days);
      }
  
      return selectedDate;
    });
  };
  
  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value); 
    const createdAtDate = new Date(user.createdAt);
    if (selectedDate < createdAtDate) {
      setCurrentDate(createdAtDate)
      toast({
        title: `Dates Cannot be before account creation. (${formatDate(createdAtDate)})`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    else{
      setCurrentDate(selectedDate)
    }
  };

  // Modal state for section items
  const {
    isOpen: isSectionOpen,
    onOpen: onSectionOpen,
    onClose: onSectionClose,
  } = useDisclosure();
  
  const [selectedSectionItem, setSelectedSectionItem] = useState(null);


  //handler for clicking on section items
  const handleSectionItemClick = (item) => {
      console.log("Function `handleSectionItemClick` called: " + item.label);
      setSelectedSectionItem(item);
      onSectionOpen();
  };

  const handleSectionClose = () =>{
    onSectionClose();
    setTimeout(() => {
      setSelectedSectionItem(null);
    }, 300); // Optional delay
  }



  // Calculate total calories from all sections
  const calculateTotalCalories = () => {
    return [...breakfastItems, ...lunchItems, ...dinnerItems, ...snackItems].reduce(
      (total, item) => total + (Math.floor(item.calories )* item.quantity),
      0
    );
  };

   

  const totalCalories = calculateTotalCalories();
  const progressValue = (totalCalories / calorieGoal) * 100;

  const fetchFoodData = async () => {
    console.log("Running `fetchFoodData` now.");
    
    if (query === '') {
      toast({
        title: "Please enter a food item to search.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {

      const response = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?ingr=${query}&app_id=${appId}&app_key=${appKey}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      console.log("API Data Hints:", data.hints);
      if (data.hints.length === 0){
        toast({
          title: "No Food Item's Found",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setFoodData(data.hints || []); 
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching food data:", error);
      toast({
        title: "Error fetching data.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    
  };
  
  // Handling page information for food requests
  const totalPages = Math.ceil(foodData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  //Slice of the array that we are on
  const currentItems = foodData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    console.log(currentItems)
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  

  //handling food selection

  const handleItemClick = (item) => {
    console.log("Function `handleItemClick` triggered");  // log to see if function is triggered
    console.log("Clicked item:", item); // item data
    
    setSelectedItem(item);
    onOpen(); // open the drawer
  };


  const handleCloseDrawer = () => {
    onClose(); 
    // Delay clearing the selectedItem to prevent UI freeze
    setTimeout(() => {
      setSelectedItem(null);
    }, 300); // 300ms delay, adjust if needed
  };

  //adding items to main menu 
  const addItemToSection = async (section, item) => {
 
    // Send API request to add meal
    const mealData = {
      section,
      label: item.food.label,
      calories: Math.ceil(item.food.nutrients.ENERC_KCAL * item.quantity),
      quantity: item.quantity,
      nutrients: {
        protein: item.food.nutrients.PROCNT ? Math.ceil(item.food.nutrients.PROCNT * item.quantity) : 0,
        fat: item.food.nutrients.FAT ? Math.ceil(item.food.nutrients.FAT * item.quantity) : 0,
        carbohydrates: item.food.nutrients.CHOCDF ? Math.ceil(item.food.nutrients.CHOCDF * item.quantity) : 0,
      }
    }

    await addMealRequest(mealData);
    
    setQuantity(0);
    handleCloseDrawer();
  };

  // Fetch meals for a given date when the date changes
  useEffect(() => {
    // console.log(meals)
    const fetchMealsData = async () => {
      const fetchedMeals = await fetchMeals(); 
      if (fetchedMeals && fetchedMeals.length > 0) {
        setMeals(fetchedMeals); 
      }
    };
  
    fetchMealsData(); 
  }, [currentDate]); 
  
  // Update meal whenever meals changes (happens on different day or whenever meals are added/adjusted)
  useEffect(() => {
    
    if (meals.length > 0) {
      // Populate section items based on fetched meal data
      const breakfast = meals.filter(meal => meal.section === 'Breakfast');
      const lunch = meals.filter(meal => meal.section === 'Lunch');
      const dinner = meals.filter(meal => meal.section === 'Dinner');
      const snacks = meals.filter(meal => meal.section === 'Snacks');
  
      setBreakfastItems(breakfast);
      setLunchItems(lunch);
      setDinnerItems(dinner);
      setSnackItems(snacks);
    }
    else{
      setBreakfastItems([]);
      setLunchItems([]);
      setDinnerItems([]);
      setSnackItems([]);
    }
  }, [meals]); 

  const adjustItemInSection = async (selectedSectionItem, quantity) =>{
    
    // Update the quantity set for the updated value
    const updatedItem = {
      ...selectedSectionItem,
      quantity: quantity,
    };

    // Run an update call here
    try {
      // Send the updated meal data to the backend
      const response = await fetch(`http://54.86.232.234:3000/api/meal/update-meal/${selectedSectionItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(updatedItem),  
      });

      if (response.ok) {
        // update successfull refetch the meals
        await fetchMeals();
      } else {
        console.error('Failed to update meal');
      }
    } catch (error) {
      console.error('Error updating meal:', error);
    }  
    handleSectionClose(); 
  };

  //Allow for a limit of going over 20% of total cals
  const maxAllowedQuantity = selectedItem
  ? Math.min(
      Math.ceil(((calorieGoal - totalCalories) / (selectedItem.calories || 1)) * 1.8),
      maxServings
    )
  : 1;

  const adjustQuantity = selectedSectionItem ? Math.min(
    Math.ceil(((calorieGoal - totalCalories) / (selectedSectionItem.calories || 1)) * 1.8),
    maxServings
    
  )
  : 1;

  const renderSectionItems = (sectionItems) => (
    <List spacing={2} mt={2}>
      {sectionItems.map((meal) => (
        <ListItem key={meal._id}>
            {/* Display label, quantity, and total calories for the item */}
            <Box
            as="button"
            padding="1"
            borderWidth="2px"
            width={'100%'}
            textAlign="left" 
            alignContent={'left'}
            borderRadius={'md'}
            pl ={'10px'}
            onClick={() => handleSectionItemClick(meal)}
            >
            <Stat>{meal.label} ({meal.quantity})  
            <StatHelpText size={'sm'}>
              {Math.floor(meal.nutrients.protein) * meal.quantity} p | {Math.floor(meal.nutrients.fat)* meal.quantity} f | {Math.floor(meal.nutrients.carbohydrates)* meal.quantity} c | {(Math.floor(meal.calories) * meal.quantity)} calories
            </StatHelpText></Stat>
            </Box>
        </ListItem>
      ))}
    </List>
  );
  
// Function to calculate total macros
const getTotalMacros = () => {
  const allItems = [...breakfastItems, ...lunchItems, ...dinnerItems, ...snackItems];
  
  return allItems.reduce(
    (totals, item) => ({
      calories:totals.calories + (Math.floor( item.calories) * item.quantity),
      protein: totals.protein + (Math.floor( item.nutrients.protein) * item.quantity),
      fat: totals.fat + (Math.floor(item.nutrients.fat ) * item.quantity),
      carbohydrates: totals.carbohydrates +  (Math.floor(item.nutrients.carbohydrates ) * item.quantity),
    }), {calories: 0, protein: 0, fat: 0, carbohydrates: 0}
  );
};

async function addMealRequest(mealData) {
  const selectedDate = formatDate(currentDate);
  try {
    const response = await fetch(`http://54.86.232.234:3000/api/meal/log-meal/${userId}/?date=${selectedDate}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(mealData)  // Send the meal data in the body
    });
    // Check if the meal was added successfully
    if (response.status === 200) {
      await fetchMeals();
    }
    } catch (error) {
      console.error('Error adding meal:', error);
      
    }
}

async function fetchMeals() {
  const selectedDate = formatDate(currentDate);
  try {
      const response = await fetch(`http://54.86.232.234:3000/api/meal/get-meals/${userId}?date=${selectedDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok) {
          setMeals(result.data);  
      } else {
          throw new Error(result.message);
      }
      
  } catch (error) {
      console.error("Error fetching meals:", error.message);
  }
};



const totalMacros = getTotalMacros();

return( 
    <Box>
      <NavBar></NavBar>
        {
          // main menu with meals being tracked here
        }
        <Box w="50%" p={8} mt={10} borderWidth={1} borderRadius={8} boxShadow="lg" mx="auto">
            <Center>
                <Heading mb={6}>Track Your Meals</Heading>
            </Center>
            {/* Date Navigation */}
            <Center mb={4}>
              <HStack spacing={4}>
              <Button onClick={() => adjustDate(-1)}>{'<'}</Button>
                  <FormControl>
                    <FormLabel FormLabel textAlign="center" w="full">
                      {formatDate(currentDate)}
                    </FormLabel>
                    <Input
                        onChange={handleDateChange}
                        size='sm'
                        type="date"
                        value={currentDate}
                        // max={new Date().toLocaleDateString('en-CA')}
                        min={new Date(user.createdAt).toISOString().split('T')[0]}
                    />
                  </FormControl>
                <Button onClick={() => adjustDate(1)}>{'>'}</Button>
              </HStack>
            </Center>
              {/* Calorie Goal Progress Bar */}
            <VStack spacing={4} mt={4}>
                <Stat> 
                  <StatHelpText> 
                  Calories Consumed {totalCalories} / {calorieGoal} Calorie Goal
                  </StatHelpText>
                </Stat> 
                <Stat style={{ display: progressValue > 100 ? 'block' : 'none' }}>
                  <StatHelpText>
                    <Text color="red">WARNING: over calorie goal!</Text>
                  </StatHelpText>
                </Stat>
              <Progress colorScheme={progressValue > 100 ? "orange" : "green"} size="lg" value={progressValue} w="75%"/>
              <Stack direction={'row'}>
                <Box 
                p={4} 
                borderWidth={1} 
                borderRadius="md" 
                mt={2}
                backgroundColor={'rgba(54, 162, 235, 0.6)'}
                w = "100px"
                >
                  <Stat> 
                  <StatHelpText> 
                  Protein 
                  </StatHelpText>
                  </Stat>
                 {totalMacros.protein}</Box>
                <Box
                p={4} 
                borderWidth={1} 
                borderRadius="md" 
                mt={2}
                w = "100px"
                backgroundColor={'rgba(255, 99, 132, 0.6)'}
                >
                <Stat> 
                  <StatHelpText> 
                  Fat 
                  </StatHelpText>
                  </Stat>  
                  {totalMacros.fat}</Box>
                <Box
                p={4} 
                borderWidth={1} 
                borderRadius="md" 
                mt={2}
                w = "100px"
                backgroundColor={'rgba(255, 206, 86, 0.6)'}
                >
                <Stat> 
                  <StatHelpText> 
                  Carbs
                  </StatHelpText>
                  </Stat>
                  {totalMacros.carbohydrates}</Box>
              </Stack>
            </VStack>
            <Box w="75%" p={8} mt={10} borderWidth={1} borderRadius={8} boxShadow="lg" mx="auto">
              <Heading size="md">Meals</Heading>
              {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((section) => (
              <Box key={section} mt={8}>
                <Heading size="sm">{section}</Heading>
                {renderSectionItems(
                  {
                    Breakfast: breakfastItems,
                    Lunch: lunchItems,
                    Dinner: dinnerItems,
                    Snacks: snackItems,
                  }[section]
                )}
                </Box>
              ))}
            </Box>

            {/* Section Item Modal */}
            <Modal isOpen={isSectionOpen} onClose={handleSectionClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                
                <Heading fontWeight="normal" marginBottom={3}>Edit {selectedSectionItem?.section}</Heading>
                  {selectedSectionItem?.label} ({quantity ? quantity: selectedSectionItem?.quantity}) {(quantity? quantity *  Math.floor(selectedSectionItem?.calories) : Math.floor(selectedSectionItem?.foodcalories) * selectedSectionItem?.quantity)} calories</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {/* Content and actions of selected item*/}
                  
                  <Center>
                    <Stack direction={'row'}>
                    <Box p={4} 
                        borderWidth={2} 
                        borderRadius="md" 
                        mt={2}
                        backgroundColor={'rgba(54, 162, 235, 0.6)'}
                        w = "100px">
                      <Text>{quantity? quantity * Math.floor(selectedSectionItem?.nutrients.protein) :Math.floor(selectedSectionItem?.nutrients.protein) * selectedSectionItem?.quantity} p 
                      </Text> 
                    </Box> 
                    <Box
                        p={4} 
                        borderWidth={2} 
                        borderRadius="md" 
                        mt={2}
                        w = "100px"
                        backgroundColor={'rgba(255, 99, 132, 0.6)'}
                        >
                      <Text>
                      {quantity? quantity * Math.floor(selectedSectionItem?.nutrients.fat) :Math.floor(selectedSectionItem?.nutrients.fat)* selectedSectionItem?.quantity} f  
                      </Text>
                    </Box>
                    <Box
                      p={4} 
                      borderWidth={1} 
                      borderRadius="md" 
                      mt={2}
                      w = "100px"
                      backgroundColor={'rgba(255, 206, 86, 0.6)'}
                      >
                    {quantity? quantity * Math.floor(selectedSectionItem?.nutrients.calories) : Math.floor(selectedSectionItem?.nutrients.carbohydrates)* (selectedSectionItem?.quantity)} c </Box>
                    </Stack>
                  </Center>
                  <Text mt = {'5'}>Adjust Quantity: {quantity}</Text>
                    <Slider 
                        aria-label="quantity-slider"
                        defaultValue={selectedItem?.quantity}
                        min={0}
                        max={adjustQuantity > 0 ? adjustQuantity: selectedSectionItem?.quantity} // Adjust this based on calorie goal and item data
                        onChange={(value) => setQuantity(value)}
                        value={quantity}
                        step={0.5}
                      >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                </ModalBody>
                <ModalFooter>
                  <Button variant="outline" mr={3} onClick={handleCloseDrawer}>Cancel</Button>
                  <Button colorScheme="blue" mr={3} onClick={() => adjustItemInSection(selectedSectionItem, quantity)}>Make Changes</Button>
                  <Button colorScheme="red" mr={3} onClick={() => adjustItemInSection(selectedSectionItem, 0)}>Delete Item</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <FormControl mt={8}>
                <InputGroup>
                    <Input placeholder="Search for food..."
                    backgroundColor='gray.200'
                    mt = {8}
                    onChange = {(e) => setQuery(e.target.value)}
                    onKeyDown={(e)=>{
                      if (e.key === 'Enter'){
                        fetchFoodData();
                      }
                    }}
                    textAlign={'center'}
                    value = {query}
                    autoComplete="off">
                        
                    </Input>
                </InputGroup>
                <Button 
                w = "100%"
                onClick={fetchFoodData}
                mt ={1}
                >
                Search
                </Button>
            </FormControl>
        </Box>
        {
          // search results components
        }
        <Box w="75%" p={8} mt={10} borderWidth={1} borderRadius={8} boxShadow="lg" mx="auto">
          <Stack direction='column'>
          <Heading size="md">Track Your Meals</Heading>
          
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
                <Box key={index} 
                p={4} 
                borderWidth={1} 
                borderRadius="md" 
                mt={2}
                as="button"
                textAlign="left"
                _hover={{ backgroundColor: "gray.200", cursor: "pointer" }}
                onClick={() => handleItemClick(item)}>
                  <Text fontWeight="bold">{item.food.label} {item.food.brand !== undefined ? ` (${item.food.brand})` : ``}</Text>
                  <Text>Category: {item.food.category}</Text>
                  <Text>Calories: {Math.ceil(item.food.nutrients.ENERC_KCAL) || "0"} kcal</Text>
                  {item.measures && item.measures.length > 0 ? (
                    <Text>Per: 1 {item.measures[0].label} ({Math.ceil(item.measures[0].weight)} g)</Text>
                  ) : (
                    <Text>Serving Size: N/A</Text>
                  )}
                </Box>
        
            ))
          ) : (
            
            <Text>No results to display.</Text>
            
          )}
          {
          // Prev/Forward components
          }
          <Box mt={8} display="flex" justifyContent="space-between" p={8} borderWidth={1} borderRadius={8}>
            <Button 
              onClick={handlePreviousPage} 
              isDisabled={currentPage === 1}
              w = "33%"
              p = {30}
            >
              Previous 
            </Button>
            <Text mt ={5}>{currentPage} of {Math.max(totalPages, 1)}</Text>
            <Button 
              onClick={handleNextPage} 
              isDisabled={currentPage === (totalPages > 0 ? totalPages : 1)}
              w = "33%"
              p = {30}
            >
              Next 
            </Button>
          </Box>
          
        </Stack>
      </Box>
      {/* Drawer for selected food item */}
      <Drawer isOpen={isOpen} placement="bottom" onClose={handleCloseDrawer}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Add Food</DrawerHeader>
          <DrawerBody alignItems={'center'}>
            {selectedItem && (
              <VStack spacing={4} align="start">
                <Text fontWeight="bold">{selectedItem.food.label}</Text>
                <Text>Category: {selectedItem.food.category}</Text>
                <Text>
                  Calories per serving: {Math.ceil(selectedItem.food.nutrients.ENERC_KCAL)} kcal
                </Text>

                

                {/* Total calories display */}
                <Text>
                  Total Calories: {Math.ceil(selectedItem.food.nutrients.ENERC_KCAL * quantity)} kcal
                </Text>
                {/* Nutritional Breakdown */}
                <Box mt={4}>
                  <Heading size="sm">Nutritional Breakdown:</Heading>
                  <Text>Protein: {selectedItem.food.nutrients.PROCNT ? Math.ceil(selectedItem.food.nutrients.PROCNT * quantity) : "0"} g</Text>
                  <Text>Fat: {selectedItem.food.nutrients.FAT ? Math.ceil(selectedItem.food.nutrients.FAT * quantity) : "0"} g</Text>
                  <Text>Carbohydrates: {selectedItem.food.nutrients.CHOCDF ? Math.ceil(selectedItem.food.nutrients.CHOCDF * quantity) : "0"} g</Text>
                </Box>
                

                {/* Quantity slider */}
                <Box width="25%" boxShadow = "lg">
                  <Text>Quantity: {quantity} {quantity > 9 ? `Servings (${Math.ceil(quantity * selectedItem.measures[0].weight)} grams)` : `Serving (${Math.ceil(quantity * selectedItem.measures[0].weight)} grams)`}</Text>
                  <Slider
                    min={0}
                    max={maxAllowedQuantity}
                    value={quantity}
                    step={0.5}
                    onChange={(value) => setQuantity(value)}
                    w="100%"
                
                    defaultValue = {[0]}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>
                {/* Meal section buttons */}
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((section) => (
                  <Button
                    key={section}
                    colorScheme="blue"
                    onClick={() => addItemToSection(section, { ...selectedItem, quantity})}
                    width='100%'
                    isDisabled ={quantity > 0 ? false: true}
                  >
                    Add to {section}
                  </Button>
                ))}
                
              </VStack>
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button colorScheme="red" onClick={handleCloseDrawer}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default NutritionForm