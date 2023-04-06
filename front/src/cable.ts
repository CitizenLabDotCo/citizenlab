// react-frontend/src/cable.js
import { createConsumer } from '@rails/actioncable';
const URL = 'ws://localhost:3000/cable'; // What to replace localhost:3000 with on production?
const consumer = createConsumer(URL);

export default consumer;
