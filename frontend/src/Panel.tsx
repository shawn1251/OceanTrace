import './Panel.css'
import React, { useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, Button, SelectChangeEvent } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { createTheme, ThemeProvider } from '@mui/material/styles';

interface PanelProps {
    onFetchTrajectoryData: (mmsi: string, startTime: Dayjs | null, endTime: Dayjs | null) => void;
    mmsiList: string[];
  }

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Panel: React.FC<PanelProps> = ({ onFetchTrajectoryData, mmsiList}) => {
  const [panelOpen, setPanelOpen] = useState(false)
  const handlePanelToggle = () => {
    setPanelOpen(!panelOpen);
  };
  const [selectedMmsi, setMmsi] = useState<string>('');
  const handleMmsiSelect = (event: SelectChangeEvent) => {
    setMmsi(event.target.value)
  }
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs('2012-11-04T07:11:59'));
  const [endTime, setEndTime] = useState<Dayjs | null>(dayjs('2012-12-31T11:48:31'));
  
  const handleButtonClick = () => {
    onFetchTrajectoryData(selectedMmsi, startTime, endTime);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={`container ${panelOpen ? 'open' : ''}`}>
        <div className="panel">
          <FormControl fullWidth>
            <InputLabel id="mmsi-select-label">MMSI</InputLabel>
            <Select
              labelId="mmsi-select-label"
              id="mmsi-select"
              label="MMSI"
              value={selectedMmsi}
              onChange={handleMmsiSelect}
              sx={{ marginBottom: 3 }}
            >
              {mmsiList.map((mmsi, index) => (
                <MenuItem key={index} value={mmsi}>{mmsi}</MenuItem>
              ))}
            </Select>
            <LocalizationProvider dateAdapter={AdapterDayjs} >
                <DateTimePicker
                  label="Start Time Picker"
                  defaultValue={startTime}
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  sx={{ marginBottom: 3 }}
                />
                <DateTimePicker
                  label="End Time Picker"
                  defaultValue={endTime}
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  sx={{ marginBottom: 3 }}
                />
            </LocalizationProvider>
            <Button variant="outlined" className="searchBtn" onClick={handleButtonClick}>
              Search
            </Button>
          </FormControl>
        </div>
        <div className="tab" onClick={handlePanelToggle}> Menu </div>
      </div>
    </ThemeProvider>
  );
};

export default Panel;