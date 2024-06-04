"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { Nav, Col, Row, Tab, Form } from "react-bootstrap";
import RetrievalHistory from "../../Components/RetrievalHistory";
import axios from "axios";
import PanelLayout from "@/Layout/CustomLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaFilter } from "react-icons/fa";
import { CustomToast } from "@/Components/myToast";
// import AlertModal from './AlertModal';

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${formattedHours}:${formattedMinutes} ${ampm} ${day}/${month}/${year}`;
}

export default function Page() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setendDate] = useState(new Date());
  const [filterPress, setFilterPress] = useState(false);
  const { addToast } = CustomToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/sessions`,
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      if (Array.isArray(response.data)) {
        if (response.data.length > 0) {
          let temp = [...response.data];
          temp.forEach((obj) => {
            if (obj.hasOwnProperty("userName")) {
              obj.username = obj.userName;
              delete obj.userName;
            }
          });
          for (let j = 0; j < temp.length; j++) {
            let firstQueryTimestamp = null;
            for (let i = 0; i < temp[j].data.length; i++) {
              if (temp[j].data[i].role === "query") {
                firstQueryTimestamp = temp[j].data[i].timestamp;
                break;
              }
            }
            if (firstQueryTimestamp) {
              temp[j].timestamp = firstQueryTimestamp;
            }
          }
          setSessions(temp);
        }
      } else {
        addToast({message: `/sessions: Gateway error`, type: "error"})
      }
    } catch (e) {
        addToast({message: `/sessions: ${e.message}`, type: "error"})
    } finally {
      setLoading(false);
    }
  }
  
  function handleFilter() {
    fetchFilterData();
  }

  async function fetchFilterData() {
    const data = {
      start_date: startDate + "T00:00:00",
      end_date: endDate + "T23:59:59",
    };
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/sessions/filter`,
        data
      );
      setFilterPress(true);
      if (response.data.length > 0) {
        response.data.forEach((obj) => {
          if (obj.hasOwnProperty("session_id")) {
            obj.id = obj.session_id;
            delete obj.session_id;
          }
        });
        setSessions(response.data);
      }
    } catch (e) {
        addToast({message: `/sessions/filter: ${e.message}`, type: "error"})
    } finally {
      setLoading(false);
    }
  }
  const RenderChat = useCallback(
    ({ session_id }) => {
      return <RetrievalHistory session_id={session_id} />;
    },
    [selectedSession]
  );
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
          <Text fontSize={"16px"} fontWeight={"400"} mb={"0px"}>
            Sessions
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
          pt={"20px"}
          justifyContent="center"
        >
          <Flex width="100%" marginTop="40px" marginBottom="20px">
            <Form.Control
              style={{ width: "200px" }}
              type="date"
              value={startDate}
              placeholder="Start Date"
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Form.Control
              style={{ width: "200px", marginLeft: "20px" }}
              type="date"
              value={endDate}
              placeholder="End Date"
              onChange={(e) => setendDate(e.target.value)}
            />
            <Button
              width={"100px"}
              rounded={"md"}
              ml={"20px"}
              leftIcon={<FaFilter />}
              onClick={() => {
                setSelectedSession();
                setSessions([]);
                setLoading(true);
                handleFilter();
              }}
            >
              <Text fontSize={"14px"} fontWeight="400" mb={"0px"}>
                Filter
              </Text>
            </Button>
            {filterPress ? (
              <Button
                width={"100px"}
                bg={"red"}
                ml={"20px"}
                _hover={{
                  bg: "red.600",
                }}
                onClick={() => {
                  setStartDate(new Date());
                  setendDate(new Date());
                  setSelectedSession();
                  setSessions([]);
                  setLoading(true);
                  fetchData();
                  setFilterPress(false);
                }}
              >
                <Text fontSize={"14px"} fontWeight="400" mb={"0px"}>
                  Clear
                </Text>
              </Button>
            ) : null}
          </Flex>
          {loading ? (
            <Box
              w="100%"
              maxW="1200px"
              justifyContent={"center"}
              display={"flex"}
              mt={"20px"}
            >
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            </Box>
          ) : null}
        </Flex>
        <Flex
          w="100%"
          alignSelf="center"
          justifyContent="space-between"
          pt={6}
          pb={4}
        >
          <Box
            width="20%"
            bg={"white"}
            p={6}
            rounded={"md"}
            flexWrap="wrap"
            borderRadius="5px"
            boxShadow="lg"
          >
            {sessions.length != 0
              ? sessions.map((session_id, index) => (
                  <Box
                    key={index}
                    width="100%"
                    wordWrap="break-word"
                    marginBottom="5px"
                    border="1px solid"
                    borderRadius="5px"
                    borderColor="#cccccc"
                    backgroundColor={
                      selectedSession == session_id.id ? "blue.600" : "gray.100"
                    }
                    color={selectedSession == session_id.id ? "white" : "black"}
                    _hover={{
                      bg: "blue.400",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      padding={2}
                      onClick={() => {
                        setSelectedSession(session_id.id);
                      }}
                      style={{ fontSize: "13px", fontWeight: "500" }}
                    >
                      <div>{session_id.headline}</div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "10px",
                        }}
                      >
                        <div style={{ width: "48%" }}>
                          {session_id.username}
                        </div>
                        <div style={{ width: "48%", textAlign: "end" }}>
                          {formatTimestamp(session_id.timestamp)}
                        </div>
                      </div>
                    </Box>
                  </Box>
                ))
              : null}
          </Box>
          {selectedSession ? (
            <Box
              width="78%"
              bg={"white"}
              rounded={"md"}
              flexWrap="wrap"
              borderRadius="5px"
              boxShadow="lg"
              overflow={"hidden"}
            >
              <RenderChat session_id={selectedSession} />
            </Box>
          ) : null}
        </Flex>
      </div>
    </PanelLayout>
  );
}
