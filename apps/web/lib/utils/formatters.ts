import { Address, formatEther as formatEtherViem } from 'viem';
import { Optional } from '../types';

export function formatAddress(address: Address | string, slice = 4) {
  return address.slice(0, slice + 2) + '...' + address.slice(-slice);
}

export function formatEther(ethValue: Optional<bigint | string>) {
  if (!ethValue) {
    return '0';
  }

  return formatEtherViem(BigInt(ethValue)).toString().slice(0, 6);
}

export function timeAgoFormatter(dateString: string): string {
  const timestamp = new Date(dateString).getTime();
  const now = Date.now();
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;

  const elapsed = now - timestamp;

  let timeAgo;

  if (elapsed < minute) {
    timeAgo = 'just now';
  } else if (elapsed < hour) {
    let minutes = Math.round(elapsed / minute);
    timeAgo = minutes > 1 ? minutes + ' mins' : minutes + ' min';
  } else if (elapsed < day) {
    timeAgo = Math.round(elapsed / hour) + 'h';
  } else if (elapsed < month) {
    timeAgo = Math.round(elapsed / day) + 'd';
  } else if (elapsed < year) {
    timeAgo = Math.round(elapsed / month) + 'mo';
  } else {
    timeAgo = Math.round(elapsed / year) + 'y';
  }

  return timeAgo !== 'just now' ? timeAgo + ' ago' : timeAgo;
}
