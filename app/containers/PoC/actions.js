class Actions {
  toggleIdea(observer, ideaID) {
    const action = (ideas) => ideas.map((idea) => {
      if (idea.id === ideaID) {
        return {
          ...idea,
          selected: !idea.selected,
        };
      }

      if (idea.id !== ideaID && idea.selected) {
        return {
          ...idea,
          selected: false,
        };
      }

      return idea;
    });

    observer.next(action);
  }
}

export default new Actions();
