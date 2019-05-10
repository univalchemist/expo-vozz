export default [
  {
    _id: Math.round(Math.random() * 1000000),
    text: '#awesome',
    createdAt: new Date(),
    user: {
      _id: 1,
      name: 'Developer',
      avatar: 'https://images.pexels.com/photos/1250643/pexels-photo-1250643.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
    },
  },
  {
    _id: Math.round(Math.random() * 1000000),
    text: '',
    createdAt: new Date(),
    user: {
      _id: 2,
      name: 'Miguel Martinez',
    },
    image: 'https://lh3.googleusercontent.com/-uXipYA5hSKc/VVWKiFIvo-I/AAAAAAAAAhQ/vkjLyZNEzUA/w800-h800/1.jpg',
    sent: true,
    received: true,
  },
  {
    _id: Math.round(Math.random() * 1000000),
    text: 'Send me a picture!',
    createdAt: new Date(),
    user: {
      _id: 1,
      name: 'Developer',
    },
  },
  {
    _id: Math.round(Math.random() * 1000000),
    text: '',
    createdAt: new Date(),
    user: {
      _id: 2,
      name: 'Miguel Martinez',
      avatar: 'https://images.pexels.com/photos/1250643/pexels-photo-1250643.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
    },
    sent: true,
    received: true,
    location: {
      latitude: 48.864601,
      longitude: 2.398704,
    },
  },
  {
    _id: Math.round(Math.random() * 1000000),
    text: 'Where are you?',
    createdAt: new Date(),
    user: {
      _id: 1,
      name: 'Developer',
    },
  },
  {
    _id: Math.round(Math.random() * 1000000),
    text: 'Yes, and I am here.',
    createdAt: new Date(),
    user: {
      _id: 2,
      name: 'Miguel Martinez',
      avatar: 'https://images.pexels.com/photos/1250643/pexels-photo-1250643.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
    },
    sent: true,
    received: true,
  },
  {
    _id: Math.round(Math.random() * 1000000),
    text: 'Do you like the vozz app?',
    createdAt: new Date(),
    user: {
      _id: 1,
      name: 'Developer',
    },
  },
  {
    _id: Math.round(Math.random() * 1000000),
    text: 'You are officially rocking vozz-Chat.',
    createdAt: new Date(),
    system: true,
  },
];
