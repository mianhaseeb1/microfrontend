import { Bookmark } from '../models/bookmark.model';
import { v4 as uuidv4 } from 'uuid';

export const BOOKMARK_DATA: Bookmark[] = [
  {
    id: uuidv4(),
    title: 'ChatGPT links',
    links: [
      'https://chat.openai.com/auth/login?next=%2Fc%2F00335d6c-ced1-45b1-8341-f7d0b014...',
      'https://app.screencast.com/T8DD3SdNvFyZZ?conversation=DJro9fK8lJcuBIFSteSt6T',
    ],
    comment: '',
  },

  {
    id: uuidv4(),
    title: 'Web links',
    links: [
      'https://chat.openai.com/auth/login?next=%2Fc%2F00335d6c-ced1-45b1-8341-f7d0b014...',
      'https://app.screencast.com/T8DD3SdNvFyZZ?conversation=DJro9fK8lJcuBIFSteSt6T',
    ],
    comment:
      'These links should be monitored every to two weeks for updates and potential changes, especially numberAs these are',
  },
];
