import { useEffect, useRef } from 'react';
import BIRDS from 'vanta/dist/vanta.birds.min';

const Logins = () => {
    const vantaRef = useRef(null);

    useEffect(() => {
        const vantaEffect = BIRDS({
            el: vantaRef.current,
            color1: 0xff9900,
            color2: 0x5500ff,
            backgroundColor: 0x202020,
            birdSize: 1.5,
            speed: 1.5,
        });

        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, []);

    return (
        <div ref={vantaRef} className="h-screen w-full flex items-center justify-center">
            <h1 className="text-white text-3xl font-bold">Welcome to Dev Discuss</h1>
        </div>
    );
};

export default Logins;
