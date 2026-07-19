'use client';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    console.log('useEffect');
    const data = fetch('/api/user', { method: 'GET' });
    data.then((res) => res.json().then((json) => console.log(json)));
  }, []);

  return (
    <div>
      HELLO WORLD
      <Button>Click me</Button>
    </div>
  );
}
