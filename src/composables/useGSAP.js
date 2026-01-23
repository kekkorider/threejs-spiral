import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'

export function useGSAP() {
  gsap.registerPlugin(Observer)

  return {
    gsap,
    Observer
  }
}
