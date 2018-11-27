// ----------------------------------------------------//
// Se crean las instancias de las librerias a utilizar //
// ----------------------------------------------------//
var modbus = require('jsmodbus');
var fs = require('fs');
var httpClient = require('node-rest-client').Client;
var clientHttp = new httpClient();
//Asignar host, puerto y otros par ametros al cliente Modbus
var client = modbus.client.tcp.complete({
  'host': "192.168.20.15",
  'port': 502,
  'autoReconnect': true,
  'timeout': 60000,
  'logEnabled': true,
  'reconnectTimeout': 30000
}).connect();

var intId, timeStop = 40,
  flagONS1 = 0,
  flagONS2 = 0,
  flagONS3 = 0,
  flagONS4 = 0,
  flagONS5 = 0,
  flagONS6 = 0,
  flagONS7 = 0,
  flagONS8 = 0,
  flagONS9 = 0,
  flagONS10 = 0,
  flagONS11 = 0;
var BottleSorter, ctBottleSorter = 0,
  speedTempBottleSorter = 0,
  secBottleSorter = 0,
  stopCountBottleSorter = 0,
  flagStopBottleSorter = 0,
  flagPrintBottleSorter = 0,
  speedBottleSorter = 0,
  timeBottleSorter = 0;
var actualBottleSorter = 0,
  stateBottleSorter = 0;
var Fillercapper, ctFillercapper = 0,
  speedTempFillercapper = 0,
  secFillercapper = 0,
  stopCountFillercapper = 0,
  flagStopFillercapper = 0,
  flagPrintFillercapper = 0,
  speedFillercapper = 0,
  timeFillercapper = 0;
var actualFillercapper = 0,
  stateFillercapper = 0;
var PumpSorter, ctPumpSorter = 0,
  speedTempPumpSorter = 0,
  secPumpSorter = 0,
  stopCountPumpSorter = 0,
  flagStopPumpSorter = 0,
  flagPrintPumpSorter = 0,
  speedPumpSorter = 0,
  timePumpSorter = 0;
var actualPumpSorter = 0,
  statePumpSorter = 0;
var CapSorter, ctCapSorter = 0,
  speedTempCapSorter = 0,
  secCapSorter = 0,
  stopCountCapSorter = 0,
  flagStopCapSorter = 0,
  flagPrintCapSorter = 0,
  speedCapSorter = 0,
  timeCapSorter = 0;
var actualCapSorter = 0,
  stateCapSorter = 0;
var Depuck, ctDepuck = 0,
  speedTempDepuck = 0,
  secDepuck = 0,
  stopCountDepuck = 0,
  flagStopDepuck = 0,
  flagPrintDepuck = 0,
  speedDepuck = 0,
  timeDepuck = 0;
var actualDepuck = 0,
  stateDepuck = 0;
var Checkweigher1, ctCheckweigher1 = 0,
  speedTempCheckweigher1 = 0,
  secCheckweigher1 = 0,
  stopCountCheckweigher1 = 0,
  flagStopCheckweigher1 = 0,
  flagPrintCheckweigher1 = 0,
  speedCheckweigher1 = 0,
  timeCheckweigher1 = 0;
var actualCheckweigher1 = 0,
  stateCheckweigher1 = 0;
var Labeller, ctLabeller = 0,
  speedTempLabeller = 0,
  secLabeller = 0,
  stopCountLabeller = 0,
  flagStopLabeller = 0,
  flagPrintLabeller = 0,
  speedLabeller = 0,
  timeLabeller = 0;
var actualLabeller = 0,
  stateLabeller = 0;
var Casepacker, ctCasepacker = 0,
  speedTempCasepacker = 0,
  secCasepacker = 0,
  stopCountCasepacker = 0,
  flagStopCasepacker = 0,
  flagPrintCasepacker = 0,
  speedCasepacker = 0,
  timeCasepacker = 0;
var actualCasepacker = 0,
  stateCasepacker = 0;
var Printer, ctPrinter = 0,
  speedTempPrinter = 0,
  secPrinter = 0,
  stopCountPrinter = 0,
  flagStopPrinter = 0,
  flagPrintPrinter = 0,
  speedPrinter = 0,
  timePrinter = 0;
var actualPrinter = 0,
  statePrinter = 0;
var Checkweigher2, ctCheckweigher2 = 0,
  speedTempCheckweigher2 = 0,
  secCheckweigher2 = 0,
  stopCountCheckweigher2 = 0,
  flagStopCheckweigher2 = 0,
  flagPrintCheckweigher2 = 0,
  speedCheckweigher2 = 0,
  timeCheckweigher2 = 0;
var actualCheckweigher2 = 0,
  stateCheckweigher2 = 0;
var Paletizer, ctPaletizer = 0,
  speedTempPaletizer = 0,
  secPaletizer = 0,
  stopCountPaletizer = 0,
  flagStopPaletizer = 0,
  flagPrintPaletizer = 0,
  speedPaletizer = 0,
  timePaletizer = 0;
var actualPaletizer = 0,
  statePaletizer = 0;
var Barcode, secBarcode = 0;
var secEOL = 0,
  secPubNub = 5 * 60;
var publishConfig;
var flag = false,
  barcodeLast = '0';
var files = fs.readdirSync("/home/oee/Pulse/BYD_L53_LOGS/"); //Leer documentos
var actualdate = Date.now(); //Fecha actual
var text2send = []; //Vector a enviar
var flagInfo2Send = 0;
var i = 0;

function idle() {
  i = 0;
  text2send = [];
  for (k = 0; k < files.length; k++) { //Verificar los archivos
    var stats = fs.statSync("/home/oee/Pulse/BYD_L53_LOGS/" + files[k]);
    var mtime = new Date(stats.mtime).getTime();
    if (mtime < (Date.now() - (3 * 60 * 1000)) && files[k].indexOf("serialbox") == -1) {
      flagInfo2Send = 1;
      text2send[i] = files[k];
      i++;
    }
  }
}

// --------------------------------------------------------- //
//Función que realiza las instrucciones de lectura de datos  //
// --------------------------------------------------------- //
var DoRead = function() {
  client.readHoldingRegisters(0, 99).then(function(resp) {
    var statesBottleSorter = switchData(resp.register[0], resp.register[1]),
      statesFillercapper = switchData(resp.register[2], resp.register[3]),
      statesPumpSorter = switchData(resp.register[4], resp.register[5]),
      statesCapSorter = switchData(resp.register[6], resp.register[7]),
      statesDepuck = switchData(resp.register[8], resp.register[9]),
      statesCheckweigher1 = switchData(resp.register[10], resp.register[11]),
      statesLabeller = switchData(resp.register[12], resp.register[13]),
      statesCasepacker = switchData(resp.register[14], resp.register[15]),
      statesCheckweigher2 = switchData(resp.register[16], resp.register[17]),
      statesPrinter = switchData(resp.register[18], resp.register[19]),
      statesPaletizer = switchData(resp.register[20], resp.register[21]);
    //BottleSorter -------------------------------------------------------------------------------------------------------------
    ctBottleSorter = joinWord(resp.register[23], resp.register[22]);
    if (flagONS1 === 0) {
      speedTempBottleSorter = ctBottleSorter;
      flagONS1 = 1;
    }
    if (secBottleSorter >= 60) {
      if (stopCountBottleSorter === 0 || flagStopBottleSorter == 1) {
        flagPrintBottleSorter = 1;
        secBottleSorter = 0;
        speedBottleSorter = ctBottleSorter - speedTempBottleSorter;
        speedTempBottleSorter = ctBottleSorter;
      }
      if (flagStopBottleSorter == 1) {
        timeBottleSorter = Date.now();
      }
    }
    secBottleSorter++;
    if (ctBottleSorter > actualBottleSorter) {
      stateBottleSorter = 1; //RUN
      if (stopCountBottleSorter >= timeStop) {
        speedBottleSorter = 0;
        secBottleSorter = 0;
      }
      timeBottleSorter = Date.now();
      stopCountBottleSorter = 0;
      flagStopBottleSorter = 0;


    } else if (ctBottleSorter == actualBottleSorter) {
      if (stopCountBottleSorter === 0) {
        timeBottleSorter = Date.now();
      }
      stopCountBottleSorter++;
      if (stopCountBottleSorter >= timeStop) {
        stateBottleSorter = 2; //STOP
        speedBottleSorter = 0;
        if (flagStopBottleSorter === 0) {
          flagPrintBottleSorter = 1;
          ////console.log(stateBottleSorter);
          secBottleSorter = 0;
        }
        flagStopBottleSorter = 1;
      }
    }
    if (stateBottleSorter == 2) {
      speedTempBottleSorter = ctBottleSorter;
    }

    actualBottleSorter = ctBottleSorter;
    if (stateBottleSorter == 2) {
      if (statesBottleSorter[5] == 1) {
        stateBottleSorter = 3; //Wait
      } else {
        if (statesBottleSorter[4] == 1) {
          stateBottleSorter = 4; //Block
        }
      }
    }
    BottleSorter = {
      ST: stateBottleSorter,
      //  CPQI:joinWord(resp.register[21],resp.register[20]);
      CPQO: joinWord(resp.register[23], resp.register[22]),
      //  CPQR: joinWord(resp.register[23],resp.register[22]),
      SP: speedBottleSorter
    };
    if (flagPrintBottleSorter == 1) {
      for (var key in BottleSorter) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L53_LOGS/pol_byd_BottleSorter_l53.log", "tt=" + timeBottleSorter + ",var=" + key + ",val=" + BottleSorter[key] + "\n");
      }
      flagPrintBottleSorter = 0;
    }
    //BottleSorter -------------------------------------------------------------------------------------------------------------
    //Fillercapper -------------------------------------------------------------------------------------------------------------
    ctFillercapper = joinWord(resp.register[25], resp.register[24]);
    if (flagONS2 === 0) {
      speedTempFillercapper = ctFillercapper;
      flagONS2 = 1;
    }
    if (secFillercapper >= 60) {
      if (stopCountFillercapper === 0 || flagStopFillercapper == 1) {
        flagPrintFillercapper = 1;
        secFillercapper = 0;
        speedFillercapper = ctFillercapper - speedTempFillercapper;
        speedTempFillercapper = ctFillercapper;
      }
      if (flagStopFillercapper == 1) {
        timeFillercapper = Date.now();
      }
    }
    secFillercapper++;
    if (ctFillercapper > actualFillercapper) {
      stateFillercapper = 1; //RUN
      if (stopCountFillercapper >= timeStop) {
        speedFillercapper = 0;
        secFillercapper = 0;
      }
      timeFillercapper = Date.now();
      stopCountFillercapper = 0;
      flagStopFillercapper = 0;


    } else if (ctFillercapper == actualFillercapper) {
      if (stopCountFillercapper === 0) {
        timeFillercapper = Date.now();
      }
      stopCountFillercapper++;
      if (stopCountFillercapper >= timeStop) {
        stateFillercapper = 2; //STOP
        speedFillercapper = 0;
        if (flagStopFillercapper === 0) {
          flagPrintFillercapper = 1;
          ////console.log(stateFillercapper);
          secFillercapper = 0;
        }
        flagStopFillercapper = 1;
      }
    }
    if (stateFillercapper == 2) {
      speedTempFillercapper = ctFillercapper;
    }

    actualFillercapper = ctFillercapper;
    if (stateFillercapper == 2) {
      if (statesFillercapper[5] == 1) {
        stateFillercapper = 3; //Wait
      } else {
        if (statesFillercapper[4] == 1) {
          stateFillercapper = 4; //Block
        }
      }
    }
    Fillercapper = {
      ST: stateFillercapper,
      CPQI: joinWord(resp.register[25], resp.register[24]),
      CPQO: joinWord(resp.register[27], resp.register[26]),
      CPQR: joinWord(resp.register[29], resp.register[28]),
      SP: speedFillercapper
    };
    if (flagPrintFillercapper == 1) {
      for (var key in Fillercapper) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L53_LOGS/pol_byd_Fillercapper_l53.log", "tt=" + timeFillercapper + ",var=" + key + ",val=" + Fillercapper[key] + "\n");
      }
      flagPrintFillercapper = 0;
    }
    //Fillercapper -------------------------------------------------------------------------------------------------------------
    //PumpSorter -------------------------------------------------------------------------------------------------------------
    ctPumpSorter = joinWord(resp.register[31], resp.register[30]);
    if (flagONS3 === 0) {
      speedTempPumpSorter = ctPumpSorter;
      flagONS3 = 1;
    }
    if (secPumpSorter >= 60) {
      if (stopCountPumpSorter === 0 || flagStopPumpSorter == 1) {
        flagPrintPumpSorter = 1;
        secPumpSorter = 0;
        speedPumpSorter = ctPumpSorter - speedTempPumpSorter;
        speedTempPumpSorter = ctPumpSorter;
      }
      if (flagStopPumpSorter == 1) {
        timePumpSorter = Date.now();
      }
    }
    secPumpSorter++;
    if (ctPumpSorter > actualPumpSorter) {
      statePumpSorter = 1; //RUN
      if (stopCountPumpSorter >= timeStop) {
        speedPumpSorter = 0;
        secPumpSorter = 0;
      }
      timePumpSorter = Date.now();
      stopCountPumpSorter = 0;
      flagStopPumpSorter = 0;


    } else if (ctPumpSorter == actualPumpSorter) {
      if (stopCountPumpSorter === 0) {
        timePumpSorter = Date.now();
      }
      stopCountPumpSorter++;
      if (stopCountPumpSorter >= timeStop) {
        statePumpSorter = 2; //STOP
        speedPumpSorter = 0;
        if (flagStopPumpSorter === 0) {
          flagPrintPumpSorter = 1;
          ////console.log(statePumpSorter);
          secPumpSorter = 0;
        }
        flagStopPumpSorter = 1;
      }
    }
    if (statePumpSorter == 2) {
      speedTempPumpSorter = ctPumpSorter;
    }

    actualPumpSorter = ctPumpSorter;
    if (statePumpSorter == 2) {
      if (statesPumpSorter[5] == 1) {
        statePumpSorter = 3; //Wait
      } else {
        if (statesPumpSorter[4] == 1) {
          statePumpSorter = 4; //Block
        }
      }
    }
    PumpSorter = {
      ST: statePumpSorter,
      //CPQI: joinWord(resp.register[25],resp.register[24]);
      CPQO: joinWord(resp.register[31], resp.register[30]),
      //CPQR: joinWord(resp.register[29],resp.register[28]),
      SP: speedPumpSorter
    };
    if (flagPrintPumpSorter == 1) {
      for (var key in PumpSorter) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L53_LOGS/pol_byd_PumpSorter_l53.log", "tt=" + timePumpSorter + ",var=" + key + ",val=" + PumpSorter[key] + "\n");
      }
      flagPrintPumpSorter = 0;
    }
    //PumpSorter -------------------------------------------------------------------------------------------------------------
    //CapSorter -------------------------------------------------------------------------------------------------------------
    ctCapSorter = joinWord(resp.register[33], resp.register[32]);
    if (flagONS4 === 0) {
      speedTempCapSorter = ctCapSorter;
      flagONS4 = 1;
    }
    if (secCapSorter >= 60) {
      if (stopCountCapSorter === 0 || flagStopCapSorter == 1) {
        flagPrintCapSorter = 1;
        secCapSorter = 0;
        speedCapSorter = ctCapSorter - speedTempCapSorter;
        speedTempCapSorter = ctCapSorter;
      }
      if (flagStopCapSorter == 1) {
        timeCapSorter = Date.now();
      }
    }
    secCapSorter++;
    if (ctCapSorter > actualCapSorter) {
      stateCapSorter = 1; //RUN
      if (stopCountCapSorter >= timeStop) {
        speedCapSorter = 0;
        secCapSorter = 0;
      }
      timeCapSorter = Date.now();
      stopCountCapSorter = 0;
      flagStopCapSorter = 0;


    } else if (ctCapSorter == actualCapSorter) {
      if (stopCountCapSorter === 0) {
        timeCapSorter = Date.now();
      }
      stopCountCapSorter++;
      if (stopCountCapSorter >= timeStop) {
        stateCapSorter = 2; //STOP
        speedCapSorter = 0;
        if (flagStopCapSorter === 0) {
          flagPrintCapSorter = 1;
          ////console.log(stateCapSorter);
          secCapSorter = 0;
        }
        flagStopCapSorter = 1;
      }
    }
    if (stateCapSorter == 2) {
      speedTempCapSorter = ctCapSorter;
    }

    actualCapSorter = ctCapSorter;
    if (stateCapSorter == 2) {
      if (statesCapSorter[5] == 1) {
        stateCapSorter = 3; //Wait
      } else {
        if (statesCapSorter[4] == 1) {
          stateCapSorter = 4; //Block
        }
      }
    }
    CapSorter = {
      ST: stateCapSorter,
      //CPQI: joinWord(resp.register[25],resp.register[24]);
      CPQO: joinWord(resp.register[33], resp.register[32]),
      //CPQR: joinWord(resp.register[29],resp.register[28]),
      SP: speedCapSorter
    };
    if (flagPrintCapSorter == 1) {
      for (var key in CapSorter) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L53_LOGS/pol_byd_CapSorter_l53.log", "tt=" + timeCapSorter + ",var=" + key + ",val=" + CapSorter[key] + "\n");
      }
      flagPrintCapSorter = 0;
    }
    //CapSorter -------------------------------------------------------------------------------------------------------------
    //Depuck -------------------------------------------------------------------------------------------------------------
    ctDepuck = joinWord(resp.register[35], resp.register[34]);
    if (flagONS5 === 0) {
      speedTempDepuck = ctDepuck;
      flagONS5 = 1;
    }
    if (secDepuck >= 60) {
      if (stopCountDepuck === 0 || flagStopDepuck == 1) {
        flagPrintDepuck = 1;
        secDepuck = 0;
        speedDepuck = ctDepuck - speedTempDepuck;
        speedTempDepuck = ctDepuck;
      }
      if (flagStopDepuck == 1) {
        timeDepuck = Date.now();
      }
    }
    secDepuck++;
    if (ctDepuck > actualDepuck) {
      stateDepuck = 1; //RUN
      if (stopCountDepuck >= timeStop) {
        speedDepuck = 0;
        secDepuck = 0;
      }
      timeDepuck = Date.now();
      stopCountDepuck = 0;
      flagStopDepuck = 0;


    } else if (ctDepuck == actualDepuck) {
      if (stopCountDepuck === 0) {
        timeDepuck = Date.now();
      }
      stopCountDepuck++;
      if (stopCountDepuck >= timeStop) {
        stateDepuck = 2; //STOP
        speedDepuck = 0;
        if (flagStopDepuck === 0) {
          flagPrintDepuck = 1;
          ////console.log(stateDepuck);
          secDepuck = 0;
        }
        flagStopDepuck = 1;
      }
    }
    if (stateDepuck == 2) {
      speedTempDepuck = ctDepuck;
    }

    actualDepuck = ctDepuck;
    if (stateDepuck == 2) {
      if (statesDepuck[5] == 1) {
        stateDepuck = 3; //Wait
      } else {
        if (statesDepuck[4] == 1) {
          stateDepuck = 4; //Block
        }
      }
    }
    Depuck = {
      ST: stateDepuck,
      //CPQI: joinWord(resp.register[25],resp.register[24]);
      CPQO: joinWord(resp.register[35], resp.register[34]),
      //CPQR: joinWord(resp.register[29],resp.register[28]),
      SP: speedDepuck
    };
    if (flagPrintDepuck == 1) {
      for (var key in Depuck) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L53_LOGS/pol_byd_Depuck_l53.log", "tt=" + timeDepuck + ",var=" + key + ",val=" + Depuck[key] + "\n");
      }
      flagPrintDepuck = 0;
    }
    //Depuck -------------------------------------------------------------------------------------------------------------
    //Checkweigher1 -------------------------------------------------------------------------------------------------------------
    ctCheckweigher1 = joinWord(resp.register[37], resp.register[36]);
    if (flagONS6 === 0) {
      speedTempCheckweigher1 = ctCheckweigher1;
      flagONS6 = 1;
    }
    if (secCheckweigher1 >= 60) {
      if (stopCountCheckweigher1 === 0 || flagStopCheckweigher1 == 1) {
        flagPrintCheckweigher1 = 1;
        secCheckweigher1 = 0;
        speedCheckweigher1 = ctCheckweigher1 - speedTempCheckweigher1;
        speedTempCheckweigher1 = ctCheckweigher1;
      }
      if (flagStopCheckweigher1 == 1) {
        timeCheckweigher1 = Date.now();
      }
    }
    secCheckweigher1++;
    if (ctCheckweigher1 > actualCheckweigher1) {
      stateCheckweigher1 = 1; //RUN
      if (stopCountCheckweigher1 >= timeStop) {
        speedCheckweigher1 = 0;
        secCheckweigher1 = 0;
      }
      timeCheckweigher1 = Date.now();
      stopCountCheckweigher1 = 0;
      flagStopCheckweigher1 = 0;


    } else if (ctCheckweigher1 == actualCheckweigher1) {
      if (stopCountCheckweigher1 === 0) {
        timeCheckweigher1 = Date.now();
      }
      stopCountCheckweigher1++;
      if (stopCountCheckweigher1 >= timeStop) {
        stateCheckweigher1 = 2; //STOP
        speedCheckweigher1 = 0;
        if (flagStopCheckweigher1 === 0) {
          flagPrintCheckweigher1 = 1;
          ////console.log(stateCheckweigher1);
          secCheckweigher1 = 0;
        }
        flagStopCheckweigher1 = 1;
      }
    }
    if (stateCheckweigher1 == 2) {
      speedTempCheckweigher1 = ctCheckweigher1;
    }

    actualCheckweigher1 = ctCheckweigher1;
    if (stateCheckweigher1 == 2) {
      if (statesCheckweigher1[5] == 1) {
        stateCheckweigher1 = 3; //Wait
      } else {
        if (statesCheckweigher1[4] == 1) {
          stateCheckweigher1 = 4; //Block
        }
      }
    }
    Checkweigher1 = {
      ST: stateCheckweigher1,
      CPQI: joinWord(resp.register[37], resp.register[36]),
      CPQO: joinWord(resp.register[39], resp.register[38]),
      CPQR: joinWord(resp.register[41], resp.register[40]),
      SP: speedCheckweigher1
    };
    if (flagPrintCheckweigher1 == 1) {
      for (var key in Checkweigher1) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L53_LOGS/pol_byd_Checkweigher1_l53.log", "tt=" + timeCheckweigher1 + ",var=" + key + ",val=" + Checkweigher1[key] + "\n");
      }
      flagPrintCheckweigher1 = 0;
    }
    //Checkweigher1 -------------------------------------------------------------------------------------------------------------
    //Labeller -------------------------------------------------------------------------------------------------------------
    ctLabeller = joinWord(resp.register[43], resp.register[42]);
    if (flagONS7 === 0) {
      speedTempLabeller = ctLabeller;
      flagONS7 = 1;
    }
    if (secLabeller >= 60) {
      if (stopCountLabeller === 0 || flagStopLabeller == 1) {
        flagPrintLabeller = 1;
        secLabeller = 0;
        speedLabeller = ctLabeller - speedTempLabeller;
        speedTempLabeller = ctLabeller;
      }
      if (flagStopLabeller == 1) {
        timeLabeller = Date.now();
      }
    }
    secLabeller++;
    if (ctLabeller > actualLabeller) {
      stateLabeller = 1; //RUN
      if (stopCountLabeller >= timeStop) {
        speedLabeller = 0;
        secLabeller = 0;
      }
      timeLabeller = Date.now();
      stopCountLabeller = 0;
      flagStopLabeller = 0;


    } else if (ctLabeller == actualLabeller) {
      if (stopCountLabeller === 0) {
        timeLabeller = Date.now();
      }
      stopCountLabeller++;
      if (stopCountLabeller >= timeStop) {
        stateLabeller = 2; //STOP
        speedLabeller = 0;
        if (flagStopLabeller === 0) {
          flagPrintLabeller = 1;
          ////console.log(stateLabeller);
          secLabeller = 0;
        }
        flagStopLabeller = 1;
      }
    }
    if (stateLabeller == 2) {
      speedTempLabeller = ctLabeller;
    }

    actualLabeller = ctLabeller;
    if (stateLabeller == 2) {
      if (statesLabeller[5] == 1) {
        stateLabeller = 3; //Wait
      } else {
        if (statesLabeller[4] == 1) {
          stateLabeller = 4; //Block
        }
      }
    }
    Labeller = {
      ST: stateLabeller,
      CPQI: joinWord(resp.register[43], resp.register[42]),
      CPQO: joinWord(resp.register[45], resp.register[44]),
      CPQR: joinWord(resp.register[47], resp.register[46]),
      SP: speedLabeller
    };
    if (flagPrintLabeller == 1) {
      for (var key in Labeller) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L53_LOGS/pol_byd_Labeller_l53.log", "tt=" + timeLabeller + ",var=" + key + ",val=" + Labeller[key] + "\n");
      }
      flagPrintLabeller = 0;
    }
    //Labeller -------------------------------------------------------------------------------------------------------------
    //Casepacker -------------------------------------------------------------------------------------------------------------
    ctCasepacker = joinWord(resp.register[49], resp.register[48]);
    if (flagONS8 === 0) {
      speedTempCasepacker = ctCasepacker;
      flagONS8 = 1;
    }
    if (secCasepacker >= 60) {
      if (stopCountCasepacker === 0 || flagStopCasepacker == 1) {
        flagPrintCasepacker = 1;
        secCasepacker = 0;
        speedCasepacker = ctCasepacker - speedTempCasepacker;
        speedTempCasepacker = ctCasepacker;
      }
      if (flagStopCasepacker == 1) {
        timeCasepacker = Date.now();
      }
    }
    secCasepacker++;
    if (ctCasepacker > actualCasepacker) {
      stateCasepacker = 1; //RUN
      if (stopCountCasepacker >= timeStop) {
        speedCasepacker = 0;
        secCasepacker = 0;
      }
      timeCasepacker = Date.now();
      stopCountCasepacker = 0;
      flagStopCasepacker = 0;


    } else if (ctCasepacker == actualCasepacker) {
      if (stopCountCasepacker === 0) {
        timeCasepacker = Date.now();
      }
      stopCountCasepacker++;
      if (stopCountCasepacker >= timeStop) {
        stateCasepacker = 2; //STOP
        speedCasepacker = 0;
        if (flagStopCasepacker === 0) {
          flagPrintCasepacker = 1;
          ////console.log(stateCasepacker);
          secCasepacker = 0;
        }
        flagStopCasepacker = 1;
      }
    }
    if (stateCasepacker == 2) {
      speedTempCasepacker = ctCasepacker;
    }

    actualCasepacker = ctCasepacker;
    if (stateCasepacker == 2) {
      if (statesCasepacker[5] == 1) {
        stateCasepacker = 3; //Wait
      } else {
        if (statesCasepacker[4] == 1) {
          stateCasepacker = 4; //Block
        }
      }
    }
    Casepacker = {
      ST: stateCasepacker,
      CPQI: joinWord(resp.register[49], resp.register[48]),
      CPQO: joinWord(resp.register[51], resp.register[50]),
      //CPQR: joinWord(resp.register[47],resp.register[46]),
      SP: speedCasepacker
    };
    if (flagPrintCasepacker == 1) {
      for (var key in Casepacker) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L53_LOGS/pol_byd_Casepacker_l53.log", "tt=" + timeCasepacker + ",var=" + key + ",val=" + Casepacker[key] + "\n");
      }
      flagPrintCasepacker = 0;
    }
    //Casepacker -------------------------------------------------------------------------------------------------------------
    //Printer -------------------------------------------------------------------------------------------------------------
    ctPrinter = joinWord(resp.register[53], resp.register[52]);
    if (flagONS9 === 0) {
      speedTempPrinter = ctPrinter;
      flagONS9 = 1;
    }
    if (secPrinter >= 60) {
      if (stopCountPrinter === 0 || flagStopPrinter == 1) {
        flagPrintPrinter = 1;
        secPrinter = 0;
        speedPrinter = ctPrinter - speedTempPrinter;
        speedTempPrinter = ctPrinter;
      }
      if (flagStopPrinter == 1) {
        timePrinter = Date.now();
      }
    }
    secPrinter++;
    if (ctPrinter > actualPrinter) {
      statePrinter = 1; //RUN
      if (stopCountPrinter >= timeStop) {
        speedPrinter = 0;
        secPrinter = 0;
      }
      timePrinter = Date.now();
      stopCountPrinter = 0;
      flagStopPrinter = 0;


    } else if (ctPrinter == actualPrinter) {
      if (stopCountPrinter === 0) {
        timePrinter = Date.now();
      }
      stopCountPrinter++;
      if (stopCountPrinter >= timeStop) {
        statePrinter = 2; //STOP
        speedPrinter = 0;
        if (flagStopPrinter === 0) {
          flagPrintPrinter = 1;
          ////console.log(statePrinter);
          secPrinter = 0;
        }
        flagStopPrinter = 1;
      }
    }
    if (statePrinter == 2) {
      speedTempPrinter = ctPrinter;
    }

    actualPrinter = ctPrinter;
    if (statePrinter == 2) {
      if (statesPrinter[5] == 1) {
        statePrinter = 3; //Wait
      } else {
        if (statesPrinter[4] == 1) {
          statePrinter = 4; //Block
        }
      }
    }
    Printer = {
      ST: statePrinter,
      CPQI: joinWord(resp.register[53], resp.register[52]),
      CPQO: joinWord(resp.register[55], resp.register[54]),
      CPQR: joinWord(resp.register[57], resp.register[56]),
      SP: speedPrinter
    };
    if (flagPrintPrinter == 1) {
      for (var key in Printer) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L53_LOGS/pol_byd_Printer_l53.log", "tt=" + timePrinter + ",var=" + key + ",val=" + Printer[key] + "\n");
      }
      flagPrintPrinter = 0;
    }
    //Printer -------------------------------------------------------------------------------------------------------------
    //Checkweigher2 -------------------------------------------------------------------------------------------------------------
    ctCheckweigher2 = joinWord(resp.register[59], resp.register[58]);
    if (flagONS10 === 0) {
      speedTempCheckweigher2 = ctCheckweigher2;
      flagONS10 = 1;
    }
    if (secCheckweigher2 >= 60) {
      if (stopCountCheckweigher2 === 0 || flagStopCheckweigher2 == 1) {
        flagPrintCheckweigher2 = 1;
        secCheckweigher2 = 0;
        speedCheckweigher2 = ctCheckweigher2 - speedTempCheckweigher2;
        speedTempCheckweigher2 = ctCheckweigher2;
      }
      if (flagStopCheckweigher2 == 1) {
        timeCheckweigher2 = Date.now();
      }
    }
    secCheckweigher2++;
    if (ctCheckweigher2 > actualCheckweigher2) {
      stateCheckweigher2 = 1; //RUN
      if (stopCountCheckweigher2 >= timeStop) {
        speedCheckweigher2 = 0;
        secCheckweigher2 = 0;
      }
      timeCheckweigher2 = Date.now();
      stopCountCheckweigher2 = 0;
      flagStopCheckweigher2 = 0;


    } else if (ctCheckweigher2 == actualCheckweigher2) {
      if (stopCountCheckweigher2 === 0) {
        timeCheckweigher2 = Date.now();
      }
      stopCountCheckweigher2++;
      if (stopCountCheckweigher2 >= timeStop) {
        stateCheckweigher2 = 2; //STOP
        speedCheckweigher2 = 0;
        if (flagStopCheckweigher2 === 0) {
          flagPrintCheckweigher2 = 1;
          ////console.log(stateCheckweigher2);
          secCheckweigher2 = 0;
        }
        flagStopCheckweigher2 = 1;
      }
    }
    if (stateCheckweigher2 == 2) {
      speedTempCheckweigher2 = ctCheckweigher2;
    }

    actualCheckweigher2 = ctCheckweigher2;
    if (stateCheckweigher2 == 2) {
      if (statesCheckweigher2[5] == 1) {
        stateCheckweigher2 = 3; //Wait
      } else {
        if (statesCheckweigher2[4] == 1) {
          stateCheckweigher2 = 4; //Block
        }
      }
    }
    Checkweigher2 = {
      ST: stateCheckweigher2,
      CPQI: joinWord(resp.register[59], resp.register[58]),
      CPQO: joinWord(resp.register[61], resp.register[60]),
      CPQR: joinWord(resp.register[63], resp.register[62]),
      SP: speedCheckweigher2
    };
    if (flagPrintCheckweigher2 == 1) {
      for (var key in Checkweigher2) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L53_LOGS/pol_byd_Checkweigher2_l53.log", "tt=" + timeCheckweigher2 + ",var=" + key + ",val=" + Checkweigher2[key] + "\n");
      }
      flagPrintCheckweigher2 = 0;
    }
    //Checkweigher2 -------------------------------------------------------------------------------------------------------------
    //Paletizer -------------------------------------------------------------------------------------------------------------
    ctPaletizer = joinWord(resp.register[65], resp.register[64]);
    if (flagONS11 === 0) {
      speedTempPaletizer = ctPaletizer;
      flagONS11 = 1;
    }
    if (secPaletizer >= 60) {
      if (stopCountPaletizer === 0 || flagStopPaletizer == 1) {
        flagPrintPaletizer = 1;
        secPaletizer = 0;
        speedPaletizer = ctPaletizer - speedTempPaletizer;
        speedTempPaletizer = ctPaletizer;
      }
      if (flagStopPaletizer == 1) {
        timePaletizer = Date.now();
      }
    }
    secPaletizer++;
    if (ctPaletizer > actualPaletizer) {
      statePaletizer = 1; //RUN
      if (stopCountPaletizer >= timeStop) {
        speedPaletizer = 0;
        secPaletizer = 0;
      }
      timePaletizer = Date.now();
      stopCountPaletizer = 0;
      flagStopPaletizer = 0;


    } else if (ctPaletizer == actualPaletizer) {
      if (stopCountPaletizer === 0) {
        timePaletizer = Date.now();
      }
      stopCountPaletizer++;
      if (stopCountPaletizer >= timeStop) {
        statePaletizer = 2; //STOP
        speedPaletizer = 0;
        if (flagStopPaletizer === 0) {
          flagPrintPaletizer = 1;
          ////console.log(statePaletizer);
          secPaletizer = 0;
        }
        flagStopPaletizer = 1;
      }
    }
    if (statePaletizer == 2) {
      speedTempPaletizer = ctPaletizer;
    }

    actualPaletizer = ctPaletizer;
    if (statePaletizer == 2) {
      if (statesPaletizer[5] == 1) {
        statePaletizer = 3; //Wait
      } else {
        if (statesPaletizer[4] == 1) {
          statePaletizer = 4; //Block
        }
      }
    }
    Paletizer = {
      ST: statePaletizer,
      CPQI: joinWord(resp.register[65], resp.register[64]),
      //CPQO: joinWord(resp.register[61],resp.register[60]),
      //CPQR: joinWord(resp.register[63],resp.register[62]),
      SP: speedPaletizer
    };
    if (flagPrintPaletizer == 1) {
      for (var key in Paletizer) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L53_LOGS/pol_byd_Paletizer_l53.log", "tt=" + timePaletizer + ",var=" + key + ",val=" + Paletizer[key] + "\n");
      }
      flagPrintPaletizer = 0;
    }
    //Paletizer -------------------------------------------------------------------------------------------------------------
    //Barcode -------------------------------------------------------------------------------------------------------------
    if (resp.register[68] == 0 && resp.register[69] == 0 && resp.register[70] == 0 && resp.register[71] == 0 && resp.register[72] == 0 && resp.register[73] == 0 && resp.register[74] == 0 && resp.register[75] == 0) {
      Barcode = '0';
    } else {
      var dig1 = hex2a(assignment(resp.register[68]).toString(16));
      var dig2 = hex2a(assignment(resp.register[69]).toString(16));
      var dig3 = hex2a(assignment(resp.register[70]).toString(16));
      var dig4 = hex2a(assignment(resp.register[71]).toString(16));
      var dig5 = hex2a(assignment(resp.register[72]).toString(16));
      var dig6 = hex2a(assignment(resp.register[73]).toString(16));
      var dig7 = hex2a(assignment(resp.register[74]).toString(16));
      var dig8 = hex2a(assignment(resp.register[75]).toString(16));
      Barcode = dig1 + dig2 + dig3 + dig4 + dig5 + dig6 + dig7 + dig8;
    }
    if (isNaN(Barcode) || Barcode == '0') {
      Barcode = '0';
    }
    if (secBarcode >= 60) {
      writedataBarcode(Barcode, "pol_byd_Barcode_l53.log");
      secBarcode = 0;
    }
    secBarcode++;
    //Barcode -------------------------------------------------------------------------------------------------------------
    //EOL --------------------------------------------------------------------------------------------------------------------
    if (secEOL >= 60) {
      fs.appendFileSync("../BYD_L53_LOGS/pol_byd_EOL_l53.log", "tt=" + Date.now() + ",var=EOL" + ",val=" + Paletizer.CPQI + "\n");
      secEOL = 0;
    }
    secEOL++;
    //EOL --------------------------------------------------------------------------------------------------------------------
    if (secPubNub >= 60 * 5) {
      function idle() {
        i = 0;
        text2send = [];
        for (k = 0; k < files.length; k++) { //Verificar los archivos
          var stats = fs.statSync("/home/oee/Pulse/BYD_L53_LOGS/" + files[k]);
          var mtime = new Date(stats.mtime).getTime();
          if (mtime < (Date.now() - (3 * 60 * 1000)) && files[k].indexOf("serialbox") == -1) {
            flagInfo2Send = 1;
            text2send[i] = files[k];
            i++;
          }
        }
      }

      secPubNub = 0;
      idle();
      publishConfig = {
        headers: {
          "Content-Type": "application/json"
        },
        data: {
          message: {
            line: "53",
            tt: Date.now(),
            machines: text2send
          }
        }
      };
      senderData();
    }
    secPubNub++;
  }); //END Client Read
};
clientHttp.registerMethod("postMethod", "http://35.160.68.187:23000/heartbeatLine/Byd", "POST");

function senderData() {
  clientHttp.methods.postMethod(publishConfig, function(data, response) {
    // parsed response body as js object
    console.log(data.toString());
  });
}

function hex2a(hex) {
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

var assignment = function(val) {
  var result;
  if (val < 4095)
    result = "";
  else
    result = val;
  return result;
};

var stateMachine = function(data) {
  if (data[7] == 1) {
    return 1; //RUN
  }
  if (data[6] == 1) {
    return 2; //STOP
  }
  if (data[5] == 1) {
    return 3; //WAIT
  }
  if (data[4] == 1) {
    return 4; //BLOCK
  }
  return 2;
};

var counterState = function(actual, temp) {
  if (actual != temp) {
    return 1;
  } else {
    return 2;
  }
};

var writedata = function(varJson, nameFile) {
  var data;
  var timet = Date.now();
  for (var key in varJson) {
    fs.appendFileSync("/home/pi/Pulse/BYD_L53_LOGS/" + nameFile, "tt=" + timet + ",var=" + key + ",val=" + varJson[key] + "\n");
  }
};

var writedataBarcode = function(barcode, nameFile) {
  var timet = Date.now();
  fs.appendFileSync("../BYD_L53_LOGS/" + nameFile, "tt=" + timet + ",var=bc" + ",val=" + barcode + "\n");
};

var joinWord = function(num1, num2) {
  var bits = "00000000000000000000000000000000";
  var bin1 = num1.toString(2),
    bin2 = num2.toString(2),
    newNum = bits.split("");

  for (var i = 0; i < bin1.length; i++) {
    newNum[31 - i] = bin1[(bin1.length - 1) - i];
  }
  for (var j = 0; j < bin2.length; j++) {
    newNum[15 - j] = bin2[(bin2.length - 1) - j];
  }
  bits = newNum.join("");
  return parseInt(bits, 2);
};
var switchData = function(num1, num2) {
  var bits = "00000000000000000000000000000000";
  var bin1 = num1.toString(2),
    bin2 = num2.toString(2),
    newNum = bits.split("");

  for (var i = 0; i < bin1.length; i++) {
    newNum[15 - i] = bin1[(bin1.length - 1) - i];
  }
  for (var j = 0; j < bin2.length; j++) {
    newNum[31 - j] = bin2[(bin2.length - 1) - j];
  }
  bits = newNum.join("");

  return bits;
};

var stop = function() {
  ///This function clean data
  clearInterval(intId);
};

var shutdown = function() {
  ///Use function STOP and close connection
  stop();
  client.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


///*If client is connect call a function "DoRead"*/
client.on('connect', function(err) {
  setInterval(function() {
    DoRead();
  }, 1000);
});

///*If client is in a error ejecute an acction*/
client.on('error', function(err) {
  fs.appendFileSync("error.log", "ID 1: " + Date.now() + ": " + err + "\n");
  //console.log('Client Error', err);
});
///If client try closed, this metodo try reconnect client to server
client.on('close', function() {
  //console.log('Client closed, stopping interval.');
  fs.appendFileSync("error.log", "ID 2: " + Date.now() + ": " + 'Client closed, stopping interval.' + "\n");
  stop();
});
