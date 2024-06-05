// components/PdfViewer.js
import { Box, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { GlobalWorkerOptions, getDocument, } from 'pdfjs-dist/build/pdf'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;


const PdfViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <Box>
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Spinner />}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <Box display="flex" justifyContent="space-between" mt={4}>
        <button onClick={() => setPageNumber(pageNumber - 1)} disabled={pageNumber <= 1}>
          Previous
        </button>
        <button onClick={() => setPageNumber(pageNumber + 1)} disabled={pageNumber >= numPages}>
          Next
        </button>
      </Box>
    </Box>
  );
};

export default PdfViewer;
