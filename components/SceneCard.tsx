
import React from 'react';
import { Scene } from '../types';

interface SceneCardProps {
  scene: Scene;
  isTop: boolean;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, isTop }) => {
  return (
    <div
      className={`absolute w-full h-full transition-all duration-300 ease-in-out flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden`}
      style={{ backfaceVisibility: 'hidden' }}
    >
      <div className="w-full h-3/5 bg-orange-100 flex-shrink-0">
        {scene.imageUrl ? (
          <img src={scene.imageUrl} alt={scene.imagePrompt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-orange-300"></div>
          </div>
        )}
      </div>
      <div className="w-full flex-grow p-4 md:p-6 overflow-y-auto">
        <p className="text-gray-700 text-lg md:text-xl leading-relaxed">{scene.text}</p>
      </div>
    </div>
  );
};

export default SceneCard;
