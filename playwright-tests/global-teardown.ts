/// <reference types="node" />
import { execSync } from 'child_process';

export default async () => {
  console.log('Global Teardown: killing port 4200');
  try {
    execSync('npx kill-port 4200', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error killing port 4200', error);
  }
};
