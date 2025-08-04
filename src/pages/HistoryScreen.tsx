import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoryHistory } from '../hooks/useStoryHistory';
import Header from '../components/Header';
import { Story } from '../types';
import { TrashIcon } from '../components/icons/Icons';

const StoryHistoryCard: React.FC<{ story: Story; onClick: () => void; onDelete: (e: React.MouseEvent) => void; }> = ({ story, onClick, onDelete }) => {
    const firstSceneWithImage = story.scenes.find(s => s.imageUrl);
    return (
        <div onClick={onClick} className="relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 group">
            <div className="h-40 bg-orange-200">
                {firstSceneWithImage && <img src={firstSceneWithImage.imageUrl} alt={story.title} className="w-full h-full object-cover" />}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate">{story.title}</h3>
                <p className="text-sm text-gray-500 capitalize truncate">{story.params.theme}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(story.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full capitalize">
                {story.params.language.split('-')[0]}
            </div>
            <button 
                onClick={onDelete} 
                className="absolute bottom-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Delete story"
            >
                <TrashIcon />
            </button>
        </div>
    );
};

const HistoryScreen: React.FC = () => {
  const { stories, deleteStory } = useStoryHistory();
  const navigate = useNavigate();

  const handleStoryClick = (story: Story) => {
    navigate('/story', { state: { story } });
  };

  const handleDeleteClick = (e: React.MouseEvent, storyId: string) => {
      e.stopPropagation(); // prevent navigation
      if(window.confirm("Are you sure you want to delete this story forever?")) {
        deleteStory(storyId);
      }
  }

  return (
    <div className="p-6">
      <Header title="My Storybook" subtitle="Revisit your favorite tales" />
      
      {stories.length === 0 ? (
        <div className="text-center py-20">
            <p className="text-gray-500">You haven't saved any stories yet.</p>
            <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-orange-500 text-white font-bold rounded-full shadow-md hover:bg-orange-600">
                Create a New Story
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {stories.map(story => (
            <StoryHistoryCard 
                key={story.id} 
                story={story} 
                onClick={() => handleStoryClick(story)} 
                onDelete={(e) => handleDeleteClick(e, story.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;
