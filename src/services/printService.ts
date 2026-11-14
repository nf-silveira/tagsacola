/**
 * Impressão pelo navegador.
 *
 * A área imprimível é montada pela página com as dimensões em milímetros; este
 * service apenas dispara o diálogo de impressão. O cortador da Sweda SI-300 é
 * comandado pela própria impressora depois do trabalho de impressão.
 */

export function printLabelSheet(): void {
  window.print()
}
