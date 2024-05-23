import React, { useRef, useState, useEffect } from 'react';
import cook_book from '../images/cook_book.png';
import welcome_aboard_uncolored from '../images/welcome_aboard_uncolored.png';
import welcome_aboard from '../images/welcome_aboard.png';
import first_taste from '../images/first_taste.png';
import first_taste_uncolored from '../images/first_taste_uncolored.png';
import recipe_developer from '../images/recipe_developer.png';
import recipe_developer_uncolored from '../images/recipe_developer_uncolored.png';
import culinary_architect from '../images/culinary_architect.png';
import culinary_architect_uncolored from '../images/culinary_architect_uncolored.png';
import taste_tester from '../images/taste_tester.png';
import taste_tester_uncolored from '../images/taste_tester_uncolored.png';
import savory_critic from '../images/savory_critic.png';
import savory_critic_uncolored from '../images/savory_critic_uncolored.png';
import epicurean_evaluator from '../images/epicurean_evaluator.png';
import epicurean_evaluator_uncolored from '../images/epicurean_evaluator_uncolored.png';
import gourmet_judge from '../images/gourmet_judge.png';
import gourmet_judge_uncolored from '../images/gourmet_judge_uncolored.png';
import star_chef from '../images/star_chef.png';
import star_chef_uncolored from '../images/star_chef_uncolored.png';
import master_chef from '../images/master_chef.png';
import master_chef_uncolored from '../images/master_chef_uncolored.png';
import cooking_enthusiast from '../images/cooking_enthusiast.png';
import cooking_enthusiast_uncolored from '../images/cooking_enthusiast_uncolored.png';
import culinary_virtuoso from '../images/culinary_virtuoso.png';
import culinary_virtuoso_uncolored from '../images/culinary_virtuoso_uncolored.png';
import gastronomy_guru from '../images/gastronomy_guru.png';
import gastronomy_guru_uncolored from '../images/gastronomy_guru_uncolored.png';
import seasoned_member from '../images/seasoned_member.png';
import seasoned_member_uncolored from '../images/seasoned_member_uncolored.png';
import veteran_cook from '../images/veteran_cook.png';
import veteran_cook_uncolored from '../images/veteran_cook_uncolored.png';
import culinary_explorer from '../images/culinary_explorer.png';
import culinary_explorer_uncolored from '../images/culinary_explorer_uncolored.png';
import "../stylesheets/Awards.css";
import Award from "../interface/AwardInterface";
import User from "../interface/UserInterface";

interface Props {
    awards: Award[];
    user: User | null;
}

const Awards: React.FC<Props> = ({ awards, user }) => {
    const [popupPosition, setPopupPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });
    const awardsContainerRef = useRef<HTMLDivElement>(null);
    const [visiblePopup, setVisiblePopup] = useState<string | null>(null);
    const hoveredAwardRef = useRef<string | null>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLImageElement>, award: string) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = awardsContainerRef.current?.getBoundingClientRect();

        hoveredAwardRef.current = award;

        if (containerRect) {
            setPopupPosition({
                top: rect.top - containerRect.top,
                left: rect.left - containerRect.left + 120
            });
        }

        hoverTimeoutRef.current = setTimeout(() => {
            if (hoveredAwardRef.current === award) {
                setVisiblePopup(award);
            }
        }, 500); // Adjust delay as needed
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimeoutRef.current!);
        hoveredAwardRef.current = null;
        setVisiblePopup(null);
    };

    const isAwardColored = (awardId : number) => {
        if (user && user.awards_id) {
            return user.awards_id.includes(awardId);
        }
        return false;
    };

    return (
        <div className="awards-wrapper">
            <div className="awards-container" ref={awardsContainerRef}>
                <img src={cook_book} className="cook-book" alt="Cook Book Award" />
                <img
                    src={isAwardColored(1) ? welcome_aboard : welcome_aboard_uncolored}
                    className="welcome-aboard"
                    alt="Welcome Aboard"
                    onMouseEnter={(e) => handleMouseEnter(e, 'welcome-aboard')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'welcome-aboard' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong> Welcome Aboard</strong>
                        <p>{awards.find(award => award.name === 'Welcome Aboard')?.description}</p>

                    </div>
                )}
                <img
                    src={isAwardColored(2) ? first_taste : first_taste_uncolored}
                    className="first-taste"
                    alt="First Taste"
                    onMouseEnter={(e) => handleMouseEnter(e, 'First Taste')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'First Taste' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>First Taste</strong>
                        <p>{awards.find(award => award.name === 'First Taste')?.description}</p>
                    </div>
                )}
                <img
                    src={isAwardColored(3) ? recipe_developer : recipe_developer_uncolored}
                    className="recipe-developer"
                    alt="Recipe Developer"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Recipe Developer')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Recipe Developer' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Recipe Developer</strong>
                        <p>{awards.find(award => award.name === 'Recipe Developer')?.description}</p>
                    </div>
                )}
                <img
                    src={isAwardColored(4) ? culinary_architect : culinary_architect_uncolored}
                    className="culinary-architect"
                    alt="Culinary Architect"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Culinary Architect')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Culinary Architect' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Culinary Architect</strong>
                        <p>{awards.find(award => award.name === 'Culinary Architect')?.description}</p>
                    </div>
                )}
                <img
                    src={isAwardColored(5) ? taste_tester : taste_tester_uncolored}
                    className="taste-tester"
                    alt="Taste Tester"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Taste Tester')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Taste Tester' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Taste Tester</strong>
                        <p>{awards.find(award => award.name === 'Taste Tester')?.description}</p>
                    </div>
                )}

                <img
                    src={isAwardColored(6) ? savory_critic : savory_critic_uncolored}
                    className="savory-critic"
                    alt="Savory Critic"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Savory Critic')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Savory Critic' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Savory Critic</strong>
                        <p>{awards.find(award => award.name === 'Savory Critic')?.description}</p>
                    </div>
                )}

                <img
                    src={isAwardColored(7) ? epicurean_evaluator : epicurean_evaluator_uncolored}
                    className="epicurean-evaluator"
                    alt="Epicurean Evaluator"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Epicurean Evaluator')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Epicurean Evaluator' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Epicurean Evaluator</strong>
                        <p>{awards.find(award => award.name === 'Epicurean Evaluator')?.description}</p>
                    </div>
                )}

                <img
                    src={isAwardColored(8) ? gourmet_judge : gourmet_judge_uncolored}
                    className="gourmet-judge"
                    alt="Gourmet Judge"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Gourmet Judge')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Gourmet Judge' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Gourmet Judge</strong>
                        <p>{awards.find(award => award.name === 'Gourmet Judge')?.description}</p>
                    </div>
                )}

                <img
                    src={isAwardColored(9) ? star_chef : star_chef_uncolored}
                    className="star-chef"
                    alt="Star Chef"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Star Chef')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Star Chef' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Star Chef</strong>
                        <p>{awards.find(award => award.name === 'Star Chef')?.description}</p>
                    </div>
                )}

                <img
                    src={isAwardColored(10) ? master_chef : master_chef_uncolored}
                    className="master-chef"
                    alt="Master Chef"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Master Chef')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Master Chef' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Master Chef</strong>
                        <p>{awards.find(award => award.name === 'Master Chef')?.description}</p>
                    </div>
                )}

                <img
                    src={isAwardColored(11) ? cooking_enthusiast : cooking_enthusiast_uncolored}
                    className="cooking-enthusiast"
                    alt="Cooking Enthusiast"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Cooking Enthusiast')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Cooking Enthusiast' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Cooking Enthusiast</strong>
                        <p>{awards.find(award => award.name === 'Cooking Enthusiast')?.description}</p>
                    </div>
                )}

                <img
                    src={isAwardColored(12) ? culinary_virtuoso : culinary_virtuoso_uncolored}
                    className="culinary-virtuoso"
                    alt="Culinary Virtuoso"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Culinary Virtuoso')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Culinary Virtuoso' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Culinary Virtuoso</strong>
                        <p>{awards.find(award => award.name === 'Culinary Virtuoso')?.description}</p>
                    </div>
                )}

                <img
                    src={isAwardColored(13) ? gastronomy_guru : gastronomy_guru_uncolored}
                    className="gastronomy-guru"
                    alt="Gastronomy Guru"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Gastronomy Guru')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Gastronomy Guru' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Gastronomy Guru</strong>
                        <p>{awards.find(award => award.name === 'Gastronomy Guru')?.description}</p>
                    </div>
                )}

                <img
                    src={isAwardColored(14) ? seasoned_member : seasoned_member_uncolored}
                    className="seasoned-member"
                    alt="Seasoned Member"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Seasoned Member')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Seasoned Member' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Seasoned Member</strong>
                        <p>{awards.find(award => award.name === 'Seasoned Member')?.description}</p>
                    </div>
                )}

                <img
                    src={isAwardColored(15) ? veteran_cook : veteran_cook_uncolored}
                    className="veteran-cook"
                    alt="Veteran Cook"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Veteran Cook')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Veteran Cook' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Veteran Cook</strong>
                        <p>{awards.find(award => award.name === 'Veteran Cook')?.description}</p>
                    </div>
                )}

                <img
                    src={isAwardColored(16) ? culinary_explorer : culinary_explorer_uncolored}
                    className="culinary-explorer"
                    alt="Culinary Explorer"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Culinary Explorer')}
                    onMouseLeave={handleMouseLeave}
                />
                {visiblePopup === 'Culinary Explorer' && (
                    <div
                        className={`popup visible`}
                        style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    >
                        <strong>Culinary Explorer</strong>
                        <p>{awards.find(award => award.name === 'Culinary Explorer')?.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Awards;
