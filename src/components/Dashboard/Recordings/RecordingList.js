"use client";

import React, {useState, useEffect, useRef} from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableContainer,
  TableFooter,
  TablePagination,
  TableRow,
  Paper,
  TableHead,
  TableBody,
  TableCell,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from '@mui/material/Chip';
import TextField from "@mui/material/TextField";
import {useRouter} from "next/navigation";
import dynamic from "next/dynamic";

// Import WaveSurfer dynamically to prevent SSR issues in Next.js 14
const WavesurferPlayer = dynamic(() => import("@wavesurfer/react"), { ssr: false });


export default function RecordingList() {
  const [accountFilter, setAccountFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [startDate, setStartDate] = useState(dayjs().subtract(30, "day"));
  const [endDate, setEndDate] = useState(dayjs());
  const [accounts, setAccounts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [gradedRecordings, setGradedRecordings] = useState(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFetching, setIsFetching] = useState(false);
  const [currentAudio, setCurrentAudio] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [selectedRecording, setSelectedRecording] = useState({ objectKey: "", recordingId: "" });
  const [wavesurfer, setWavesurfer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const waveSurferRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [unregisteredAgents, setUnregisteredAgents] = useState(new Set());

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [accountsRes, agentsRes] = await Promise.all([
          fetch("/api/accounts/fetch"),
          fetch("/api/agents/fetch"),
        ]);

        const accountsData = await accountsRes.json();
        const agentsData = await agentsRes.json();

        setAccounts(accountsData.accounts || []);
        setAgents(agentsData.agents || []);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchFilters();
  }, []);
  const applyFilters = async () => {
    try {
      const encodedAccount = encodeURIComponent(accountFilter); // Encode special characters
      console.log("The encoded account", encodedAccount);

      const encodedAgent = encodeURIComponent(agentFilter); // Encode agent filter if needed
      const formattedStartDate = startDate.startOf("day").toISOString();
      const formattedEndDate = endDate.endOf("day").toISOString();

      const apiUrl = `/api/recordings/fetch?account=${encodedAccount}&agent=${encodedAgent}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&page=${page}&limit=${rowsPerPage}`;
      const response = await fetch(apiUrl);
      console.log("the api url:", apiUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch recordings from the database.");
      }

      const data = await response.json();
      setFilteredRows(data.recordings || []);
      setPage(0); // Reset pagination
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };
  const resetFilters = () => {
    setAccountFilter("");
    setAgentFilter("");
    setStartDate(dayjs().subtract(30, "day"));
    setEndDate(dayjs());
    setFilteredRows([]);
  };
  useEffect(() => {
    console.log("current audio log: ", currentAudio)
  }, [currentAudio]);

  useEffect(() => {
    console.log("Accounts Fetched: ", accounts);
  }, [accounts]);

  // ✅ Fetch graded recordings after records are loaded
  useEffect(() => {
    if (filteredRows.length === 0) return;

    const fetchGradedRecordings = async () => {
      try {
        const recordingIds = filteredRows.map(row => row._id); // Extract recording IDs

        const response = await fetch("/api/grading/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordingIds }),
        });

        if (!response.ok) throw new Error("Failed to check graded recordings.");

        const { gradedIds } = await response.json();
        setGradedRecordings(new Set(gradedIds)); // ✅ Store graded IDs in state
      } catch (error) {
        console.error("Error fetching graded recordings:", error);
      }
    };

    fetchGradedRecordings();
  }, [filteredRows]);
  // Fetch unregistered agents
  useEffect(() => {
    if (filteredRows.length === 0) return;

    const fetchUnregisteredAgents = async () => {
      try {
        const res = await fetch("/api/unregistered-agents");
        if (!res.ok) {
          console.error("Failed to fetch unregistered agents");
          return;
        }
        const data = await res.json();
        const names = Array.isArray(data) ? data.map(agent => agent.fullName?.trim()?.toLowerCase()) : [];
        setUnregisteredAgents(new Set(names));
      } catch (error) {
        console.error("Error fetching unregistered agents:", error);
      }
    };

    fetchUnregisteredAgents();
  }, []);

  useEffect(() => {
    console.log("unregistered agents", unregisteredAgents)
  }, [unregisteredAgents])



  // const handlePlay = async (objectKey, _id) => {
  //   try {
  //     console.log("The object key:", objectKey);
  //     console.log("The recording ID:", _id);
  //
  //     // Fetch the temporary file from the server
  //     const response = await fetch(
  //       `/api/recordings/play?key=${encodeURIComponent(objectKey)}&_id=${_id}`,
  //     );
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch audio file");
  //     }
  //
  //     const { fileUrl } = await response.json();
  //     console.log("Received file URL:", fileUrl);
  //
  //     setCurrentAudio(fileUrl);
  //     setIsModalOpen(true); // Open the modal
  //   } catch (error) {
  //     console.error("Error playing audio:", error);
  //   }
  // };
  const handlePlay = async (objectKey, _id) => {
    try {
      console.log("Fetching recording for playback:", objectKey);

      const response = await fetch(
        `/api/recordings/play?key=${encodeURIComponent(objectKey)}&_id=${_id}`
      );

      if (!response.ok) throw new Error("Failed to fetch audio file.");

      const { fileUrl } = await response.json();
      console.log("Received file URL:", fileUrl);

      setCurrentAudio(fileUrl);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };
  const handleCloseModal = async () => {
    try {
      console.log("Deleting file:", currentAudio);

      // Send the file name (currentAudio) to the server for deletion
      await fetch(`/api/recordings/play?key=${encodeURIComponent(currentAudio)}`, { method: "DELETE" });

      setCurrentAudio(""); // Reset the currentAudio state
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error deleting temporary file:", error);
    }
  };

  const handleWaveSurferReady = (ws) => {
    setWavesurfer(ws);
    waveSurferRef.current = ws;
    setTotalDuration(ws.getDuration());

    // Update time dynamically
    ws.on("audioprocess", () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on("seek", (progress) => {
      setCurrentTime(progress * ws.getDuration());
    });
  };

  const togglePlayPause = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";

    const [hours, minutes, seconds] = duration.split(":").map(Number);
    const parts = [];
    if (hours) parts.push(`${hours}hr`);
    if (minutes) parts.push(`${minutes}mn`);
    if (seconds) parts.push(`${seconds}s`);
    return parts.join(" ");
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const emptyRows = Math.max(0, (1 + page) * rowsPerPage - filteredRows.length);
  const capitalize = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleOpenShareModal = (objectKey, recordingId) => {
    setSelectedRecording({ objectKey, recordingId });
    setShareModalOpen(true);
  };
  const handleCloseShareModal = () => {
    setShareModalOpen(false);
    setShareEmail("");
  };
  const handleShare = async (objectKey, recordingId) => {
    try {
      const response = await fetch('/api/sharing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectKey,
          recordingId,
          email: shareEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create share.');
      }

      console.log('Share created successfully.');
      handleCloseShareModal();
    } catch (error) {
      console.error('Error sharing recording:', error);
    }
  };

  const router = useRouter();

  const handleGrade = (row) => {
    // Find the account object based on account name
    const account = accounts.find(acc => acc.accountName === row.account);

    if (!account) {
      console.error("Account not found for:", row.account);
      return;
    }

    const queryParams = new URLSearchParams({
      recordingId: row._id,
      account: account._id, // ✅ Send accountId instead of accountName
      objectKey: row.objectKey,
      agent: row.agent,
      date: row.uploadDate,
      duration: row.duration,
    }).toString();

    router.push(`/grade?${queryParams}`);
  };


  // ✅ Modify the Grade button based on `gradedRecordings`
  const renderGradeButton = (row) => {
    if (gradedRecordings.has(row._id)) {
      return (<Chip
        label="Graded"
        variant="outlined"
        color="success"
        disabled
      />)

    }
    return (
      <Chip
        label="Grade"
        variant="outlined"
        onClick={() => handleGrade(row)}
      />
    );
  };

  // Modify the Agent name based on unregistered
  const renderAgentCell = (agentName) => {
    const name = capitalize(agentName);
    const isUnregistered = unregisteredAgents.has(agentName?.trim()?.toLowerCase());

    return isUnregistered ? (
      <Chip label={`${name} (Unregistered)`} color="error" size="small" />
    ) : (
      name
    );
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          boxShadow: "none",
          borderRadius: "10px",
          p: "25px 25px 10px",
          mb: "15px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "10px",
          }}
        >
          <Typography
            as="h3"
            sx={{
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            Recordings
          </Typography>
        </Box>

        {isFetching ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Fetching data...</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", gap: "15px", mb: "20px", alignItems: "center" }}>
              <FormControl sx={{ minWidth: 200, maxWidth: 250 }}>
                <InputLabel>Account</InputLabel>
                <Select
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                >
                  <MenuItem value="">All Accounts</MenuItem>
                  {accounts.map((account) => (
                    <MenuItem key={account._id} value={account.accountName}>
                      {account.accountName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200, maxWidth: 250 }}>
                <InputLabel>Agent</InputLabel>
                <Select
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                >
                  <MenuItem value="">All Agents</MenuItem>
                  {agents.map((agent) => (
                    <MenuItem key={agent._id} value={agent.agentName}>
                      {agent.agentName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: "flex", gap: "10px" }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newStartDate) => {
                    if (newStartDate) {
                      const maxEndDate = dayjs(newStartDate).add(30, "day");
                      if (endDate.isAfter(maxEndDate)) {
                        setEndDate(maxEndDate);
                      }
                      setStartDate(newStartDate);
                    }
                  }}
                  maxDate={dayjs()}
                  sx={{ minWidth: 150 }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newEndDate) => {
                    if (newEndDate) {
                      const minStartDate = dayjs(newEndDate).subtract(30, "day");
                      if (startDate.isBefore(minStartDate)) {
                        setStartDate(minStartDate);
                      }
                      setEndDate(newEndDate);
                    }
                  }}
                  minDate={startDate}
                  maxDate={dayjs()}
                  sx={{ minWidth: 150 }}
                />
              </Box>

              <Button variant="contained" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button variant="outlined" onClick={resetFilters}>
                Reset Filters
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Account</TableCell>
                    <TableCell>Testing Number</TableCell>
                    <TableCell>Agent</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Play</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.length > 0 ? (
                    filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <TableRow key={row._id || index}>
                        <TableCell>{row.account}</TableCell>
                        <TableCell>{row.testingNumber || "N/A"}</TableCell>
                        <TableCell>{renderAgentCell(row.agent)}</TableCell>
                        <TableCell>{dayjs(row.uploadDate).format("MM/DD/YYYY")}</TableCell>
                        <TableCell>{row.callTime}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handlePlay(row.objectKey, row._id)}
                          >
                            Play
                          </Button>
                        </TableCell>
                        <TableCell>{formatDuration(row.duration) || "N/A"}</TableCell>
                        {/* ✅ Show Grade/Graded button */}
                        <TableCell>
                          <Chip
                            label="Share"
                            variant="outlined"
                            onClick={() => handleOpenShareModal(row.objectKey, row._id)}
                          />
                          {renderGradeButton(row)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body1" color="textSecondary">
                          Please select filters to display data. If nothing appears, there is no data available for the provided filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[10, 25, 50]}
                      count={filteredRows.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
            {/*/!* Modal for Audio Player *!/*/}
            {/*<Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>*/}
            {/*  <DialogTitle>Audio Player</DialogTitle>*/}
            {/*  <DialogContent>*/}
            {/*    {currentAudio && (*/}
            {/*      <audio*/}
            {/*        src={currentAudio}*/}
            {/*        controls*/}
            {/*        autoPlay*/}
            {/*        onEnded={handleCloseModal}*/}
            {/*        style={{ width: "100%" }}*/}
            {/*      >*/}
            {/*        Your browser does not support the audio element.*/}
            {/*      </audio>*/}
            {/*    )}*/}
            {/*  </DialogContent>*/}
            {/*  <DialogActions>*/}
            {/*    <Button onClick={handleCloseModal} color="secondary">*/}
            {/*      Close*/}
            {/*    </Button>*/}
            {/*  </DialogActions>*/}
            {/*</Dialog>*/}
            {/*🎵 Modal for Waveform Player*/}
            <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
              {/* 🎧 Recording Title - Ensured it's WHITE */}
              <DialogTitle
                sx={{
                  color: "#ffffff !important", // Force white text
                  backgroundColor: "#353434",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  pb: 2,
                }}
              >
                <span role="img" aria-label="headphones">🎧</span> Recording
              </DialogTitle>

              {/* 🎵 Waveform Player */}
              <DialogContent
                sx={{
                  backgroundColor: "#353434",
                  color: "white",
                  textAlign: "center",
                  p: 5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {currentAudio ? (
                  <Box sx={{ width: "100%", position: "relative" }}>
                    <WavesurferPlayer
                      ref={waveSurferRef}
                      height={80}
                      waveColor="#007bff" // Blue waveform color
                      progressColor="#FF9800" // Orange progress color
                      barWidth={2}
                      barHeight={1}
                      cursorWidth={2}
                      cursorColor="white"
                      responsive={true}
                      normalize={true}
                      url={currentAudio}
                      onReady={handleWaveSurferReady}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                    {/* Timer Display (Dynamic) */}
                    <Typography
                      sx={{
                        position: "absolute",
                        bottom: "-25px",
                        right: "10px",
                        fontSize: "14px",
                        color: "#B0B0B0",
                      }}
                    >
                      {formatTime(currentTime)} / {formatTime(totalDuration)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography>Loading waveform...</Typography>
                )}
              </DialogContent>

              {/* 🎮 Controls */}
              <DialogActions sx={{ backgroundColor: "#121212", p: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  onClick={togglePlayPause}
                  sx={{
                    backgroundColor: isPlaying ? "#FF9800" : "#007bff",
                    "&:hover": { backgroundColor: isPlaying ? "#e68900" : "#0056b3" },
                  }}
                >
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button onClick={handleCloseModal} sx={{ color: "#E0E0E0" }}>
                  Close
                </Button>
              </DialogActions>
            </Dialog>





            {/*Share Recording Modal*/}
            <Dialog open={shareModalOpen} onClose={handleCloseShareModal} maxWidth="sm" fullWidth>
              <DialogTitle>Share Recording</DialogTitle>
              <DialogContent>
                <Typography>Please enter the recipient's email address:</Typography>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  sx={{ mt: 2 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseShareModal} color="secondary">
                  Cancel
                </Button>
                <Button
                  onClick={() => handleShare(selectedRecording.objectKey, selectedRecording.recordingId)}
                  color="primary"
                  disabled={!shareEmail}
                >
                  Share
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Card>
    </LocalizationProvider>
  );
}
