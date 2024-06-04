"use client";
import PanelLayout from "@/Layout/CustomLayout";
import { useRef, useState, useEffect } from "react";
import { IoMdCloudUpload, IoMdDownload } from "react-icons/io";
import {
  Box,
  Center,
  Container,
  Heading,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Button,
  Spinner,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Skeleton,
  SkeletonText,
  Stack,
  Img,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
  ModalCloseButton,
  Accordion,
  Card,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Text,
  Progress,
} from "@chakra-ui/react";
import { MdDeleteForever } from "react-icons/md";
import axios from "axios";
import { FaEye, FaFile } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { CustomToast } from "@/Components/myToast";

export default function Page() {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [percent, setPercent] = useState(-1);
  const [uploadingIndex, setUploadingIndex] = useState(-1);

  const { addToast } = CustomToast();

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const handleFileChange = (event) => {
    const fileList = Array.from(event.target.files);
    setFiles(fileList);
  };

  const removeFile = (index) => {
    const updatedFiles = [...files.filter((item, i) => i != index)];
    setFiles(updatedFiles);
  };

  const uploadFiles = async () => {
    for (const [index, file] of files.entries()) {
      setUploadingIndex(index);
      const formData = new FormData();
      formData.append("file", file);
      await axios
        .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/`, formData, {
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            let percentCompleted = Math.floor((loaded * 100) / total);
            setPercent(percentCompleted);
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          if (response.status === 200) {
            console.log(`File ${file.name} uploaded successfully`);
            addToast({
              message: `File ${file.name} uploaded successfully`,
              type: "success",
            });
            setPercent(-1);
          } else if (response.status === 100) {
            console.log("Processing started for file:", file.name);
          }
        })
        .catch((error) => {
          console.error(`Error uploading file ${file.name}:`, error.message);
          addToast({
            message: `Error uploading file ${file.name}: ${error.message}`,
            type: "error",
          });
        });
    }
    setLoading(false);
    setPercent(-1);
    setFiles([]);
    setUploadingIndex(-1);
    fetchUploadedFiles();
  };

  const fetchUploadedFiles = async () => {
    try {
      await axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/`, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })
        .then((response) => {
          // console.log(response.data)
          if (Array.isArray(response.data)) {
            setUploadingIndex(-1);
            setPercent(-1);
            setUploadedFiles(response.data);
          } else {
            // setErrorHeader("/documents");
            // setErrorMsg(response.data);
            // setShow(true);
          }
        });
    } catch (e) {
      addToast({ message: `/documents: ${e.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const RenderSelectedFilesRows = ({ file, index }) => {
    return (
      <div>
        <Box key={index} display={"flex"} justifyContent={"space-between"}>
          <Text fontSize={"12px"}>{file.name}</Text>
          <Button size="sm" variant={"ghost"}>
            <MdDeleteForever
              size={20}
              color="red"
              onClick={() => removeFile(index)}
            />
          </Button>
        </Box>
        {uploadingIndex == index ? (
          percent != -1 ? (
            <Progress value={percent} size="xs" colorScheme="pink" />
          ) : null
        ) : null}
      </div>
    );
  };

  const RenderSelectedFiles = () => {
    return (
      files.length > 0 && (
        <Box overflow="hidden" marginBottom="15px" mt={6}>
          {files.map((file, index) => (
            <RenderSelectedFilesRows key={index} file={file} index={index} />
          ))}
        </Box>
      )
    );
  };
  const RenderUploadedRow = ({ documentId, index }) => {
    const [rowLoading, setRowLoading] = useState(false);
    const downloadFile = async (documentId) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/${documentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
        const blob = await response.blob();
        const fileName = documentId;
        const fileExtension = fileName.split(".").pop();

        if (fileExtension === "pdf") {
          const pdfBlob = new Blob([blob], { type: "application/pdf" });
          const pdfUrl = window.URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, "_blank");
        } else if (fileExtension === "txt") {
          const text = await blob.text();
          const newWindow = window.open("", "_blank");
          newWindow.document.write(`
              <html>
                <head>
                  <title>${fileName}</title>
                </head>
                <body>
                  <button id="downloadButton">Download File</button>
                  <pre>${text}</pre>
                  <script>
                    document.getElementById('downloadButton').addEventListener('click', () => {
                      const blob = new Blob([\`${text}\`], { type: 'text/plain' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', '${fileName}');
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link); 
                    });
                  </script>
                </body>
              </html>
            `);
        } else {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName || "downloadedFile");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        addToast({
          message: `/documents/${documentId}: ${error.message}`,
          type: "error",
        });
      } finally {
        setRowLoading(false);
      }
    };

    const deleteFile = async (documentId) => {
      try {
        await axios
          .delete(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/${documentId}`
          )
          .then(() => {
            fetchUploadedFiles();
          });
      } catch (e) {
        addToast({
          message: `/documents/${documentId}: ${e.message}`,
          type: "error",
        });
      } finally {
        setRowLoading(false);
      }
    };

    return (
      <Tr key={index}>
        <Td pt={0} pb={0} fontSize={"14px"}>{`${documentId} ${
          uploadingIndex == index ? (percent != -1 ? percent + "%" : "") : ""
        }`}</Td>
        <Td pt={0} pb={0} alignItems={'center'} display={'flex'}>
          {rowLoading ? (
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="md"
              my={'5px'}
            />
          ) :   <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<GiHamburgerMenu />}
            variant="ghost"
          />
          <MenuList>
            <MenuItem
              onClick={() => {
                setRowLoading(true);
                downloadFile(documentId);
              }}
              icon={<IoMdDownload />}
            >
              Download
            </MenuItem>
            <MenuItem
              onClick={() => {
                setRowLoading(true);
                deleteFile(documentId);
              }}
              icon={<MdDeleteForever />}
            >
              Delete
            </MenuItem>
          </MenuList>
        </Menu>}
        

          {/* <div style={{ display: "flex" }}>
            <Button variant="ghost">
              <MdDeleteForever
                size={"20"}
                color="red"
                onClick={() => deleteFile(documentId)}
              />
            </Button>
            <Button variant="ghost">
              <FaEye
                size={"15"}
                color="blue"
                onClick={() => downloadFile(documentId)}
              />
            </Button>
          </div> */}
        </Td>
      </Tr>
    );
  };

  const RenderUploadedFiles = () => {
    return (
      uploadedFiles.length > 0 && (
        <Box
          overflow="hidden"
          marginBottom="15px"
          mt={4}
          overflowX={"auto"}
        >
          <Box  color="white" padding="10px"></Box>
          <Table variant="striped">
            <Tbody>
              {uploadedFiles.map((file, index) => (
                <RenderUploadedRow
                  key={index}
                  documentId={file}
                  index={index}
                />
              ))}
            </Tbody>
          </Table>
        </Box>
      )
    );
  };

  return (
    <PanelLayout>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Flex
          w="100%"
          alignSelf="center"
          flexWrap="wrap"
          bg="white"
          borderRadius="5px"
          boxShadow="lg"
          mt={"10px"}
          justifyContent="center"
        >
          <Box
            p="6"
            alignSelf={"center"}
            width={"80%"}
            display={"flex"}
            flexDirection={"column"}
          >
            
            <Box
              boxShadow="base"
              p="6"
              rounded="md"
              alignSelf={"center"}
              width="fit-content"
              justifyContent={"center"}
              alignItems={"center"}
              display={"flex"}
              flexDirection={"column"}
            >
              <Img src="/upload.jpg" width={"300px"} />
              {loading ? null :  <Button
                rounded={"md"}
                onClick={() => {
                  if (inputRef.current) inputRef.current.click();
                }}
                leftIcon={<FaFile />}
              >
                <Text fontSize={"14px"} fontWeight="400">
                  Browse
                </Text>
                <input
                style={{display:'none'}}
                  ref={inputRef}
                  multiple
                  type="file"
                  onChange={handleFileChange}
                ></input>
              </Button>}
             
            </Box>
            <Text alignSelf={'center'} fontSize={"10px"} mt={"10px"}>
              Supprted formats: TXT, DOCS, PDF
            </Text>
            <RenderSelectedFiles />
            {files.length > 0 && (
              <Button
                rounded={"md"}
                onClick={() => uploadFiles()}
                // type="file"
                leftIcon={<IoMdCloudUpload />}
              >
                Upload
                <input
                  ref={inputRef}
                  multiple
                  style={{ display: "none" }}
                  type="file"
                  onChange={handleFileChange}
                ></input>
              </Button>
            )}
          </Box>
        </Flex>
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
          mt={4}
        >
          <Text fontSize={"16px"} fontWeight={"400"}>
            Uploaded files
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
          <Box width="100%" marginTop="20px">
            {loading ? (
              <Stack mt={"20px"}>
                <Skeleton height="20px" />
                <Skeleton height="20px" />
                <Skeleton height="20px" />
              </Stack>
            ) : uploadedFiles.length == 0 ? (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                  color: "#3A3A3A8C",
                  fontSize: "14px",
                }}
              >
                No documents uploaded
              </div>
            ) : (
              <RenderUploadedFiles />
            )}
          </Box>
        </Flex>
      </div>
    </PanelLayout>
  );
}
