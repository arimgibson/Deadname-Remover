export default function setStyle(): void {
  const style = document.createElement('style');
  style.innerHTML = ` 
/* Styling for the Ari's Deadname Remover extension. Classes use number at end to avoid styling conflicts. */
.ADR-2918 {
  background: linear-gradient(90deg, rgba(85,205,252,1) 0%, rgba(247,168,184,1) 25%, rgba(255,255,255,1) 50%, rgba(247,168,184,1) 75%, rgba(85,205,252,1) 100%);
}
`;
  document.head.appendChild(style);
}
