import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import GameScreen from './GameScreen';
import axios from 'axios';

// Mock assets
jest.mock('../assets/airplaneImage.png', () => 'airplaneImage.png');
jest.mock('../assets/cloudImagee.png', () => 'cloudImagee.png');
jest.mock('../assets/birdImage.png', () => 'birdImage.png');
jest.mock('../assets/parachute.png', () => 'parachute.png');
jest.mock('../assets/star.png', () => 'star.png');

// Mock axios
jest.mock('axios');

describe('GameScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the game screen initially', () => {
    render(<GameScreen />);
    expect(screen.getByText(/Time:/)).toBeInTheDocument();
    expect(screen.getByText(/Fuel:/)).toBeInTheDocument();
    expect(screen.getByText(/Stars:/)).toBeInTheDocument();
  });

  test('starts game and updates time and fuel', () => {
    render(<GameScreen />);
    // Mock the intervals
    jest.useFakeTimers();

    // Check initial states
    expect(screen.getByText(/Fuel: 20/)).toBeInTheDocument();
    expect(screen.getByText(/Time: 0 seconds/)).toBeInTheDocument();

    // Fast-forward timers
    jest.advanceTimersByTime(1000);

    // Check updated states
    expect(screen.getByText(/Fuel: 19/)).toBeInTheDocument();
    expect(screen.getByText(/Time: 1 seconds/)).toBeInTheDocument();

    jest.useRealTimers();
  });

  test('handles game over state', async () => {
    render(<GameScreen />);

    // Mock the intervals
    jest.useFakeTimers();

    // Fast-forward timers to trigger game over
    jest.advanceTimersByTime(20000); // Simulate 20 seconds to deplete fuel

    // Check game over screen
    expect(await screen.findByText(/Game Over/)).toBeInTheDocument();
    expect(screen.getByText(/Fuel left: 0/)).toBeInTheDocument();

    jest.useRealTimers();
  });

  test('handles form submission', async () => {
    render(<GameScreen />);

    // Mock API responses
    axios.post.mockResolvedValue({ data: {} });

    fireEvent.change(screen.getByLabelText(/Enter Your Name:/), { target: { value: 'John Doe' } });
    fireEvent.click(screen.getByText(/Submit/));

    await waitFor(() => {
      expect(screen.getByText(/Thank you for submitting your details!/)).toBeInTheDocument();
    });

    expect(axios.post).toHaveBeenCalledWith('/api/submit', {
      name: 'John Doe',
      stars: 0,
      time: 0,
    });
  });

  test('loads ranking from API or local storage', async () => {
    render(<GameScreen />);

    // Mock API responses
    axios.get.mockResolvedValue({ data: [{ name: 'John Doe', stars: 10, time: 60 }] });

    await waitFor(() => {
      expect(screen.getByText(/Leaderboard/)).toBeInTheDocument();
    });

    // Check ranking data
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/60/)).toBeInTheDocument();
  });

  test('handles error fetching ranking from API', async () => {
    render(<GameScreen />);

    // Mock API response to fail
    axios.get.mockRejectedValue(new Error('Failed to fetch'));

    // Use local storage for ranking
    const localRanking = [{ name: 'Jane Doe', stars: 5, time: 120 }];
    localStorage.setItem('ranking', JSON.stringify(localRanking));

    await waitFor(() => {
      expect(screen.getByText(/Failed to load online ranking. Showing locally saved ranking./)).toBeInTheDocument();
    });

    // Check local ranking data
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/120/)).toBeInTheDocument();
  });
});

