module.exports = {
  query: () => {
    return Promise.resolve({
      data: [
        { pr: 'therapist',
          start: '2019-08-01',
          start_2: '20:00:00',
          app: null,
        }
      ]
    });
  }
};
