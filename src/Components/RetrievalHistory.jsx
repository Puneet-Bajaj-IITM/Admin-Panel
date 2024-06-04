import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Box, Img, Spinner, Text } from "@chakra-ui/react";
import {
  AccordionContext,
  Card,
  Accordion,
  useAccordionButton,
} from "react-bootstrap";

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

function RetrievalHistory({ session_id }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/sessions/${session_id}`
        );
        setChatHistory(res.data);
      } catch (e) {
        addToast({
          message: `/sessions/${session_id}: ${e.message}`,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [session_id]);

  function ContextAwareToggle({ children, eventKey, callback }) {
    const { activeEventKey } = useContext(AccordionContext);

    const decoratedOnClick = useAccordionButton(
      eventKey,
      () => callback && callback(eventKey)
    );

    const isCurrentEventKey = activeEventKey === eventKey;

    return (
      <button
        class="btn btn-outline-link"
        style={{ border: "0px" }}
        onClick={decoratedOnClick}
      >
        {!isCurrentEventKey ? (
          <Img
            style={{ height: "20px", width: "20px", resize: "block" }}
            src="/down_arrow_icon.png"
          />
        ) : (
          <Img
            style={{ height: "20px", width: "20px", resize: "block" }}
            src="/up_arrow_icon.png"
          />
        )}
      </button>
    );
  }


  const RenderChat = ({ role, msg, timestamp, username }) => {
    const [showMore, setShowMore] = useState(false);

    if (role == "query")
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingLeft: "16vw",
            marginBottom: "10px",
          }}
        >
          <Box
            bg={"blue.600"}
            px={"10px"}
            py={"5px"}
            color="white"
            style={{
              fontSize: "14px",
              borderRadius: "5px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              fontWeight: "400",
            }}
          >
            {showMore ? msg : msg.substring(0, 400)}
            {msg.length > 399 ? (
              <button
                className="btn btn-light"
                style={{ margin: "10px" }}
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Show less" : "Show more"}
              </button>
            ) : null}
            <div
              style={{
                fontSize: "10px",
                marginTop: "5px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {formatTimestamp(timestamp)}
            </div>
          </Box>
          <div
            style={{
              display: "flex",
              marginLeft: "10px",
              flexDirection: "column",
              maxWidth: "100px",
            }}
          >
            <Img
              style={{ height: "25px", width: "25px" }}
              src="/user_icon.png"
            />
          </div>
        </div>
      );

    if (role == "ai")
      return (
        <div
          style={{
            paddingRight: "16vw",
            display: "flex",
            flexDirection: "row",
            marginBottom: "10px",
          }}
        >
          <Img
            style={{ height: "25px", width: "25px", marginRight: "10px" }}
            src="/chatbot_icon.png"
          />

          <div
            style={{
              padding: "5px",
              backgroundColor: "#EAEAEA",
              color: "black",
              fontSize: "14px",
              borderRadius: "5px",
            }}
          >
            {showMore ? msg : msg.substring(0, 400)}
            {msg.length > 399 ? (
              <button
                className="btn btn-primary"
                style={{ margin: "10px" }}
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Show less" : "Show more"}
              </button>
            ) : null}
            <div style={{ fontSize: "10px", marginTop: "5px" }}>
              {formatTimestamp(timestamp)}
            </div>
          </div>
        </div>
      );
  };


  return loading ? (
    <Box w="100%" maxW="1200px" justifyContent={"center"} display={"flex"} mt={4}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Box>
  ) : (
    <Box>
      <div >
        <Box
          paddingX={"20px"}
          bg={"blue.700"}
          color={"white"}
          paddingY={"15px"}
        >
          <Text fontSize={"18px"} fontWeight={"600"} mb={"0px"}>
            Chat History
          </Text>
        </Box>
        <div
          className="chat-history-container"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          <ul className="list-group chat-history">
            {chatHistory.map((message, index) => {
              if (message.role === "query") {
                return (
                  <RenderChat
                    role={"query"}
                    msg={message.content}
                    timestamp={message.timestamp}
                    username={
                      message.username ? message.username : "No Username"
                    }
                  />
                );
              } else if (message.role === "human") {
                return <RenderChat role={"human"} msg={message.content} />;
              } else if (message.role === "ai") {
                return (
                  <RenderChat
                    role={"ai"}
                    msg={message.content}
                    timestamp={message.timestamp}
                  />
                );
              } else if (message.role == "data_used") {
                return (
                  <Accordion style={{ marginBottom: "10px" }}>
                    <Card
                      style={{
                        padding: "0px",
                        margin: "0px",
                        maxWidth: "100%",
                        marginBottom: "5px",
                      }}
                    >
                      <Box
                        color={"white"}
                        bg={"teal.400"}
                        paddingY={2}
                        paddingX={4}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>See details</div>
                          <ContextAwareToggle eventKey="-1"></ContextAwareToggle>
                        </div>
                      </Box>

                      <Accordion.Collapse eventKey="-1">
                        <Card.Body>
                          <div>{chatHistory[index - 1].content}</div>
                          <Accordion style={{ marginBottom: "10px" }}>
                            {message?.content?.map((item, index) => (
                              <Card
                                style={{
                                  padding: "0px",
                                  margin: "0px",
                                  maxWidth: "100%",
                                  marginBottom: "5px",
                                }}
                              >
                                <Card.Header
                                  className="bg-primary"
                                  style={{ color: "white" }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div>
                                      {`Page ${item.page} ${item.source}`}
                                    </div>
                                    <ContextAwareToggle
                                      eventKey={index}
                                    ></ContextAwareToggle>
                                  </div>
                                </Card.Header>
                                <Accordion.Collapse eventKey={index}>
                                  <Card.Body>
                                    <div style={{ textAlign: "justify" }}>
                                      <div>{`Page: ${item.page_content}`}</div>
                                    </div>
                                  </Card.Body>
                                </Accordion.Collapse>
                              </Card>
                            ))}
                          </Accordion>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
                );
              }
            })}
          </ul>
        </div>
      </div>
    </Box>
  );
}

export default RetrievalHistory;
