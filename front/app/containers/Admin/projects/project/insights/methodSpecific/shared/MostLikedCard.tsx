import React from 'react';

import DashboardCard from 'design-system/DashboardCard';

import { IIdeaData } from 'api/ideas/types';

import styles from './MostLikedCard.module.css';
import MostLikedRow from './MostLikedRow';

type Props = {
  title: string;
  description: string;
  ideas: IIdeaData[];
  // Proposals can only be liked.
  showDislikes: boolean;
};

const MostLikedCard = ({ title, description, ideas, showDislikes }: Props) => (
  <DashboardCard title={title} description={description}>
    <ul className={styles.list}>
      {ideas.map((idea) => (
        <MostLikedRow key={idea.id} idea={idea} showDislikes={showDislikes} />
      ))}
    </ul>
  </DashboardCard>
);

export default MostLikedCard;
