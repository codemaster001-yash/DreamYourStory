
import React, { useMemo } from 'react';
import { useStoryHistory } from '../hooks/useStoryHistory';
import Header from '../components/Header';
import { Character } from '../types';
import { useNavigate } from 'react-router-dom';

const CharacterCard: React.FC<{ character: Character; onClick: () => void; }> = ({ character, onClick }) => {
    return (
        <div onClick={onClick} className="flex flex-col items-center text-center cursor-pointer group">
            <div className="w-24 h-24 rounded-full shadow-lg overflow-hidden border-4 border-white bg-orange-200 transform group-hover:scale-110 transition-transform duration-300">
                 {character.imageUrl ? (
                    <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl">?</span>
                    </div>
                )}
            </div>
            <h3 className="mt-2 font-bold text-gray-800 text-sm">{character.name}</h3>
        </div>
    );
};


const CharactersScreen: React.FC = () => {
    const { stories } = useStoryHistory();
    const navigate = useNavigate();

    const uniqueCharacters = useMemo(() => {
        const allCharacters = stories.flatMap(story => story.characters);
        const uniqueMap = new Map<string, Character>();
        allCharacters.forEach(char => {
            if (!uniqueMap.has(char.name)) {
                uniqueMap.set(char.name, char);
            }
        });
        return Array.from(uniqueMap.values());
    }, [stories]);

    const handleCharacterClick = (characterName: string) => {
        navigate('/history', { state: { filterCharacter: characterName } });
    }

    return (
        <div className="p-6">
            <Header title="Characters" subtitle="All the friends you've met" />
            
            {uniqueCharacters.length === 0 ? (
                 <div className="text-center py-20">
                    <p className="text-gray-500">You haven't met any characters yet.</p>
                    <p className="text-gray-500 mt-2">Create a story to start your collection!</p>
                    <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-orange-500 text-white font-bold rounded-full shadow-md hover:bg-orange-600">
                        Create a New Story
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                    {uniqueCharacters.map(character => (
                        <CharacterCard 
                            key={character.name} 
                            character={character} 
                            onClick={() => handleCharacterClick(character.name)} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CharactersScreen;