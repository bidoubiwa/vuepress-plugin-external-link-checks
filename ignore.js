
// describe('TRY OUT', () => {
//   it('should print the correct output', async () => {
//     const clp = spawn('node', [cliPath, `-s`, `${tempfile}`]);
//     clp.stdout.on('data', (data) => {
//       console.log(`stdout: ${data}`);
//     });
//     clp.stderr.on('data', (data) => {
//       console.error(`ps stderr: ${data}`);
//     });
//     try {
//       await cmd.execute(cliPath, [`-s`, `${tempfile}`]);
//     } catch (e) {
//       expect(e.trim()).to.equal(
//         'Missing hostname'
//       );
//     }
//   });
// });
