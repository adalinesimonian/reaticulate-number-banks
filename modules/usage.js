import path from 'path'

/**
 * The script's filename.
 * @type {string}
 */
 const scriptFileName = path.basename(process.argv[1])

 /**
  * Basic usage instructions for the script.
  * @type {string}
  */
 const basicUsage = `${scriptFileName} - uniquely numbers Reaticulate LSBs

 Usage: ${scriptFileName} [flags...] inputfile [outputfile]

   inputfile       path to input Reabank file
   [outputfile]    optional. path to output Reabank file. defaults to input path

 Flags:

   [-?|--help]     displays full usage instructions
   [-m|--maintain] maintains all existing articulation LSBs not numbered 0
   [-p|--print]    prints output instead of writing Reabank file
   [-r|--reset]    renumbers all LSB definitions, even if they aren\'t set to 0
   [-s|--show]     prints LSB/articulation pairs after processing
   [-v|--verbose]  prints more details during processing. ignored if using -p|--print`

 /**
  * Detailed usage instructions for the script.
  * @type {string}
  */
 const detailedUsage = `
 == OVERVIEW

 This script uniquely numbers LSBs for articulation definitions in a Reabank file.
 This is useful if you have a list of articulations for a library which you want to
 use with Reaticulate and the articulations do not cleanly map to a standard such
 as UACC.

 This script numbers LSBs by going through each articulation that is defined in the
 Reabank file in order of appearance, and assigning an increasing numerical ID.

 For example, if you run

   ${scriptFileName} Reaticulate.reabank

 and Reaticulate.reabank looks like

   //! g="Orchestral Tools/Berlin Strings" n="01. Violins I Basic"
   //! m="Use corresponding Kontakt multi"
   Bank 1 1 OT-BS - Violins I Basic
   //! c=legato i=legato o=@2
   32 Legato
   //! c=legato i=legato o=@3
   2 Legato Fingered
   //! c=long i=note-half o=@4
   15 Sustains Immediate
   //! c=long i=accented-half o=@5
   8 Sustains Accented
   //! c=long i=note-whole o=@6
   4 Sustains Soft

 then the script will renumber the articulations starting from 1, and the resulting
 file will look much the same, but with the relevant lines defining the LSBs for
 articulations instead renumbered to

   1 Legato
   2 Legato Fingered
   3 Sustains Immediate
   4 Sustains Accented
   5 Sustains Soft

 Using this example, if the Reabank file later contains any entries for any
 instrument with an articulation named "Sustains Immediate", then that
 articulation\'s number would also be changed to 3. This way, you can easily use
 recordings or MIDI clips from one instrument in another so long as they both support
 an articulation with the same name.

 If you use the -m|--maintain flag, then this script will not renumber any LSBs,
 unless that LSB is set to 0. This way, you can add and number additional
 articulations without changing the LSBs of any articulations that are already in
 use in your projects.

 == LSB DEFINITIONS

 You can define all the LSBs together in one place using "//def-lsb" lines:

   //def-lsb 1 Legato
   //def-lsb 2 Legato Fingered
   //def-lsb 3 Legato Ostinato Arp
   //def-lsb 4 Sustains Immediate
   //def-lsb 5 Sustains Accented

 All LSB definitions in the Reabank file are read first before any articulations
 are numbered, regardless of where the definitions are located in the file.

 You can also have this script initialize LSB numbers in definitions by using
 "//def-lsb" lines set to a 0. For example, you could first write

   //def-lsb 0 Legato
   //def-lsb 0 Legato Fingered
   //def-lsb 4 Legato Ostinato Arp
   //def-lsb 5 Sustains Immediate
   //def-lsb 0 Sustains Accented

 and then run the script on that Reabank file, after which the definitions, as well
 any articulations in the file using those same articulation names, would be
 numbered as follows:

   //def-lsb 1 Legato
   //def-lsb 2 Legato Fingered
   //def-lsb 4 Legato Ostinato Arp
   //def-lsb 5 Sustains Immediate
   //def-lsb 3 Sustains Accented

 If you would like to renumber all your LSB definitions, even if they aren\'t set
 to 0, then use the -r|--reset flag.
 `

 /**
  * Prints usage instructions.
  * @param {boolean} fullUsage Whether or not to print the detailed usage instructions.
  */
 export default fullUsage => {
   console.log(basicUsage)
   if (fullUsage) {
     console.log(detailedUsage)
   }
 }
