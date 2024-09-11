import { createConsumer } from '@rails/actioncable';
import * as ActionCable from '@rails/actioncable';

ActionCable.logger.enabled = true;

export default createConsumer('ws://localhost:4000/cable');
// export default createConsumer();
