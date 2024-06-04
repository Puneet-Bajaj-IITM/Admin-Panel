"use client";
import PanelLayout from "@/Layout/CustomLayout";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Textarea,
  VStack,
  HStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useDisclosure,
  Text,
  Flex,
  Grid,
  GridItem,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { FaSave, FaPlus, FaTrashAlt } from "react-icons/fa";
import { CustomToast } from "@/Components/myToast";

export default function Page() {
  const specialWordsRegex = /\$\((context)\)|\$\((query)\)/g;
  const [temperature, settemperature] = useState(0);
  const [k, setk] = useState(0);
  const [llm_service, setllm_service] = useState("");
  const [system_message, setsystem_message] = useState("");
  const [prompt_with_rag, setPrompt_with_rag] = useState("");
  const [backendUrl, setBackendUrl] = useState("");
  const [services, setServices] = useState([]);
  const [llms, setllms] = useState();
  const [in_use, setIn_use] = useState({});
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [testingMode, setTestingMode] = useState(false);
  const [testingUsers, setTestingUsers] = useState([]);
  const [user, setUser] = useState("");
  const [errorHeader, setErrorHeader] = useState("");
  const [greeting, setGreeting] = useState("");
  const [firstBox, setFirstBox] = useState("");
  const [secondBox, setSecondBox] = useState("");
  const [thirdBox, setThirdBox] = useState("");
  const [promptParameter, setPromptParameter] = useState(["context", "query"]);
  const [completePrompt, setCompletePrompt] = useState(
    `${firstBox} $(${promptParameter[0]}) ${secondBox} $(${promptParameter[1]}) ${thirdBox}`
  );
  const [oldUrl, setOldUrl] = useState("");
  const { addToast } = CustomToast();
  const [backend, setBackend] = useState("");

  useEffect(() => {
    fetchData();
    // fetchBackendURL();
  }, []);

  useEffect(() => {
    setCompletePrompt(
      `${firstBox} $(${promptParameter[0]}) ${secondBox} $(${promptParameter[1]}) ${thirdBox}`
    );
  }, [firstBox, secondBox, thirdBox, promptParameter]);

  function extractTextParts(inputString) {
    const pattern =
      /^(.*?)\s*\$\((context|query)\)\s*(.*?)\$\((context|query)\)\s*(.*)$/;
    const matches = inputString.match(pattern);

    if (matches) {
      const firstPart = matches[1].trim();
      const middlePart = matches[3].trim();
      const lastPart = matches[5].trim();
      const firstPlaceholder = matches[2];

      return {
        firstPart,
        middlePart,
        lastPart,
        firstPlaceholder,
      };
    }

    return {
      firstPart: "",
      middlePart: "",
      lastPart: inputString,
      firstPlaceholder: "",
    };
  }

  const handleAddUser = (text) => {
    setTestingUsers((prevState) => [...prevState, text]);
  };

  useEffect(() => {
    setUser("");
  }, [testingUsers]);

  async function fetchData() {
    try {
      await axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/testing-users`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })
        .then((response) => {
          setTestingMode(response.data.mode);
          setTestingUsers(response.data.list);
        });
    } catch (e) {
      addToast({ message: `/testing-users: ${e.message}`, type: "error" });
    }

    try {
      await axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/greeting`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })
        .then((response) => {
          setGreeting(response.data.greeting);
        });
    } catch (e) {
      addToast({ message: `/greeting: ${e.message}`, type: "error" });
    }

    try {
      await axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get_llm_params/`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })
        .then((response) => {
          setIn_use(response.data.in_use);
          settemperature(Number(response.data.temperature));
          setk(Number(response.data.k));
          setllm_service(response.data.llm_service);
          setsystem_message(response.data.system_message);
          const newString = response?.data?.prompt_with_rag?.replace(/\n/g, "");
          const { firstPart, middlePart, lastPart, firstPlaceholder } =
            extractTextParts(newString);
          setFirstBox(firstPart);
          setSecondBox(middlePart);
          setThirdBox(lastPart);
          if (firstPlaceholder == "context") {
            setPromptParameter([firstPlaceholder, "query"]);
          } else {
            setPromptParameter([firstPlaceholder, "context"]);
          }
          setServices(response.data.services);
          setllms(response.data.llms);
        });
    } catch (e) {
      addToast({ message: `/get_llm_params: ${e.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name == "system_message") {
      setsystem_message(value);
    }
    if (name == "greeting_message") {
      setGreeting(value);
    }
  };

  const handleSubmit = async (event) => {
    const params = {
      temperature: temperature,
      k: k,
      llm_service: llm_service,
      system_message: system_message,
      in_use: in_use,
      prompt_with_rag: completePrompt,
    };
    const testingData = {
      mode: testingMode,
      list: testingUsers,
    };
    event.preventDefault();

    try {
      await axios
        .post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/testing-users`,
          testingData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          // console.log(res)
        });
    } catch (e) {
      addToast({ message: `/testing-users: ${e.message}`, type: "error" });
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/greeting`,
        { greeting: greeting },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (e) {
      addToast({ message: `/greeting: ${e.message}`, type: "error" });
    }

    try {
      await axios.post(`${appLocalizer.proxyUrl}/set_llm_params`, params, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      setLoading(false);
      addToast({ message: `/set_llm_params: ${e.message}`, type: "error" });
    } finally {
      fetchData();
    }
  };

  const handlellmsChange = (e, key) => {
    setIn_use((prevInUse) => ({
      ...prevInUse,
      [key]: e.target.value,
    }));
  };

  function handleClose() {
    setShow(false);
  }

  function removeUser(index) {
    const updatedFiles = [...testingUsers];
    updatedFiles.splice(index, 1);
    setTestingUsers(updatedFiles);
  }

  function handleUserChange(e) {
    setUser(e.target.value);
  }

  const handleMyChange = (event) => {
    const { name, value } = event.target;
    if (name == "first") {
      setFirstBox(value);
    }
    if (name == "second") {
      setSecondBox(value);
    }
    if (name == "third") {
      setThirdBox(value);
    }
    if (name == "promptParameter") {
      if (value == "context") setPromptParameter([value, "query"]);
      if (value == "query") setPromptParameter([value, "context"]);
    }
  };

  const handleInputChangeUrl = (e) => {
    setBackendUrl(e.target.value);
  };

  // const fetchBackendURL = async () => {
  //   try {
  //     const response = await axios.get(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/backendurl.php`,
  //       {
  //         headers: {
  //           "X-Requested-With": "XMLHttpRequest",
  //           "Access-Control-Allow-Origin": "*",
  //           "Cache-Control": "no-cache, no-store, must-revalidate",
  //           Pragma: "no-cache",
  //           Expires: "0",
  //         },
  //       }
  //     );
  //     setBackendUrl(response.data.backendURL);
  //     setOldUrl(response.data.backendURL);
  //   } catch (error) {
  //     console.error("Error fetching backend URL:", error);
  //   }
  // };

  // const handleSaveBackendURL = async () => {
  //   try {
  //     await axios.post(
  //       `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/save-backend-url.php`,
  //       { url: backendUrl },
  //       {
  //         headers: {
  //           "X-Requested-With": "XMLHttpRequest",
  //         },
  //       }
  //     );
  //     location.reload();
  //   } catch (error) {
  //     console.error("Error saving backend URL:", error);
  //   }
  // };

  // const handleBackendSave = () => {
  //   handleSaveBackendURL();
  //   toast({
  //     title: "Backend URL saved.",
  //     status: "success",
  //     duration: 2000,
  //     isClosable: true,
  //   });
  // };

  return (
    <PanelLayout>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Flex
          w="fit-content"
          ml={4}
          flexWrap="wrap"
          bg={"blue.600"}
          borderRadius="5px"
          boxShadow="lg"
          p={4}
          mb={"-30px"}
          fontSize={"20px"}
          fontWeight={"600"}
          color={"white"}
          zIndex={2}
        >
          <Text fontSize={"16px"} fontWeight={"400"}>
            LLM Parameters
          </Text>
        </Flex>
        <Flex
          w="100%"
          alignSelf="center"
          flexWrap="wrap"
          bg="white"
          borderRadius="5px"
          boxShadow="lg"
          p={6}
          pt={"50px"}
          justifyContent="center"
        >
          <Box w="100%" maxW="1200px">
            {loading ? (
              <Box
                w="100%"
                maxW="1200px"
                justifyContent={"center"}
                display={"flex"}
              >
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                />
              </Box>
            ) : (
              <form
                onSubmit={(e) => {
                  setLoading(true);
                  handleSubmit(e);
                }}
              >
                <VStack spacing={6} alignItems="start" w="100%">
                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 3fr" }}
                    gap={6}
                    w="100%"
                  >
                    {llms &&
                      Object.keys(llms).map((key) => (
                        <React.Fragment key={key}>
                          <GridItem>
                            <FormLabel className="label-style">
                              {`${key.toUpperCase()} LLM Name:`}
                            </FormLabel>
                          </GridItem>
                          <GridItem>
                            <Select
                              value={in_use[key]}
                              onChange={(e) => handlellmsChange(e, key)}
                            >
                              {llms[key].map((item, index) => (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              ))}
                            </Select>
                          </GridItem>
                        </React.Fragment>
                      ))}

                    <GridItem>
                      <FormLabel className="label-style">
                        LLM Service To Use:
                      </FormLabel>
                    </GridItem>
                    <GridItem>
                      <RadioGroup
                        onChange={(e) => setllm_service(e)}
                        value={llm_service}
                        name="llm_service"
                      >
                        <HStack spacing={5}>
                          {services.map((item, index) => (
                            <Radio key={index} value={item}>
                              <Text fontSize={"14px"} fontWeight={"500"}>
                                {item.toUpperCase()}
                              </Text>
                            </Radio>
                          ))}
                        </HStack>
                      </RadioGroup>
                    </GridItem>

                    <GridItem>
                      <FormLabel className="label-style">
                        Prompt Template:
                      </FormLabel>
                    </GridItem>
                    <GridItem>
                      <Grid templateColumns="repeat(5, 1fr)" gap={4} w="100%">
                        <GridItem colSpan={2}>
                          <Textarea
                            width="100%"
                            name="first"
                            value={firstBox}
                            onChange={handleMyChange}
                          />
                        </GridItem>
                        <GridItem>
                          <Select
                            width="100%"
                            value={promptParameter[0]}
                            onChange={handleMyChange}
                            name="promptParameter"
                          >
                            <option value="context">context</option>
                            <option value="query">query</option>
                          </Select>
                        </GridItem>
                        <GridItem colSpan={2}>
                          <Textarea
                            width="100%"
                            name="second"
                            value={secondBox}
                            onChange={handleMyChange}
                          />
                        </GridItem>
                        <GridItem colSpan={2}>
                          <Textarea
                            width="100%"
                            minH={0}
                            resize="none"
                            name="second"
                            value={promptParameter[1]}
                            readOnly
                          />
                        </GridItem>
                        <GridItem colSpan={2}>
                          <Textarea
                            width="100%"
                            name="third"
                            value={thirdBox}
                            onChange={handleMyChange}
                          />
                        </GridItem>
                      </Grid>
                      <Text fontSize="sm" color="gray.500">
                        {completePrompt}
                      </Text>
                    </GridItem>

                    <GridItem>
                      <FormLabel className="label-style">
                        Temperature: {temperature}
                      </FormLabel>
                    </GridItem>
                    <GridItem>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={temperature}
                        onChange={(val) =>
                          // handleInputChange({
                          //   target: { name: "temperature", value: val },
                          // })
                          settemperature(val)
                        }
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </GridItem>

                    <GridItem>
                      <FormLabel className="label-style">
                        Number of Documents (K): {k}
                      </FormLabel>
                    </GridItem>
                    <GridItem>
                      <Slider
                        min={0}
                        max={20}
                        step={1}
                        value={k}
                        onChange={(val) =>
                          // handleInputChange({
                          //   target: { name: "k", value: val },
                          // })
                          setk(val)
                        }
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </GridItem>

                    <GridItem>
                      <FormLabel className="label-style">
                        System Message:
                      </FormLabel>
                    </GridItem>
                    <GridItem>
                      <Textarea
                        name="system_message"
                        value={system_message}
                        onChange={handleInputChange}
                      />
                    </GridItem>

                    <GridItem>
                      <FormLabel className="label-style">
                        Greeting Message:
                      </FormLabel>
                    </GridItem>
                    <GridItem>
                      <Textarea
                        resize="none"
                        minH={0}
                        name="greeting_message"
                        value={greeting}
                        onChange={handleInputChange}
                      />
                    </GridItem>

                    <GridItem>
                      <FormLabel className="label-style">
                        Backend URL:
                      </FormLabel>
                    </GridItem>
                    <GridItem>
                      <Textarea
                        resize="none"
                        minH={0}
                        value={backendUrl}
                        onChange={handleInputChangeUrl}
                      />
                      {backendUrl !== oldUrl && (
                        <Button
                          // onClick={handleBackendSave}
                          leftIcon={<FaSave />}
                          colorScheme="blue"
                          mt={2}
                        >
                          Save
                        </Button>
                      )}
                    </GridItem>

                    <GridItem>
                      <FormLabel className="label-style">
                        Testing Mode:
                      </FormLabel>
                    </GridItem>
                    <GridItem>
                      <div style={{ display: "flex" }}>
                        {" "}
                        <Switch
                          isChecked={testingMode}
                          onChange={() => setTestingMode(!testingMode)}
                        />
                        <FormLabel ml={4}>
                          {testingMode ? "ON" : "OFF"}
                        </FormLabel>
                      </div>
                    </GridItem>

                    {testingMode && (
                      <>
                        <GridItem>
                          <FormLabel className="label-style">
                            Testing Users:
                          </FormLabel>
                        </GridItem>
                        <GridItem>
                          <div style={{ display: "flex" }}>
                            <Input
                              type="text"
                              placeholder="Enter email"
                              value={user}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const text = user.trim();
                                  if (text) handleAddUser(text);
                                }
                              }}
                              onChange={handleUserChange}
                            />
                            <Button
                              ml={2}
                              onClick={() => {
                                const text = user.trim();
                                if (text) handleAddUser(text);
                              }}
                              leftIcon={<FaPlus />}
                            >
                              Add
                            </Button>
                          </div>

                          {testingUsers.length > 0 && (
                            <Accordion allowToggle w="100%" mt={2}>
                              <AccordionItem>
                                <AccordionButton
                                  _expanded={{ bg: "cyan.400", color: "white" }}
                                >
                                  <Box flex="1" textAlign="left">
                                    Testing Users
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel pb={4}>
                                  {testingUsers.map((eachUser, index) => (
                                    <HStack
                                      key={index}
                                      justifyContent="space-between"
                                      p={2}
                                      bg={index % 2 === 0 ? "white" : "gray.50"}
                                    >
                                      <Text>{eachUser}</Text>
                                      <Button
                                        onClick={() => removeUser(index)}
                                        variant="ghost"
                                      >
                                        <FaTrashAlt />
                                      </Button>
                                    </HStack>
                                  ))}
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </GridItem>
                      </>
                    )}
                  </Grid>

                  <Button
                    type="submit"
                    leftIcon={<FaSave />}
                    colorScheme="blue"
                    className="save-btn"
                    w="200px"
                    alignSelf={"center"}
                  >
                    Save Parameters
                  </Button>
                </VStack>
              </form>
            )}

            <Modal isOpen={show} onClose={handleClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{errorHeader}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>{errorMsg}</ModalBody>
                <ModalFooter>
                  <Button variant="ghost" onClick={handleClose}>
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        </Flex>
      </div>
    </PanelLayout>
  );
}
