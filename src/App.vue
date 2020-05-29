<template>
  <v-app>
    <v-app-bar app color="primary" dark dense>
      <v-toolbar-title>SMS</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon dark small>
        <v-icon>mdi-account</v-icon>
      </v-btn>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            dark
            small
            class="ml-2 mr-2"
            v-on="on"
            @click="dlgSMS = true"
          >
            <v-icon>mdi-message</v-icon>
          </v-btn>
        </template>
        <span>Enviar SMS simple</span>
      </v-tooltip>
    </v-app-bar>

    <v-content>
      <v-flex class="pa-4">
        <v-layout row class="pa-3">
          <v-card width="49.5%">
            <v-card-title class="grey lighten-4">
              Mensaje
              <v-spacer></v-spacer>
              <v-select
                :items="cols"
                label="Columna de destinatarios:"
                hide-details
                dense
                v-model="columnaDestinatarios"
                ref="colDest"
              ></v-select>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-menu offset-y>
                <template :solot:activator="menu"></template>
                <v-list>
                  <v-list-item v-for="col in cols" :key="col.value">
                    <v-list-item-title>{{ col.text }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-textarea
                label="Escriba aqui el mensaje"
                v-model="mensaje"
              ></v-textarea>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="grey lighten-4">
              <v-btn color="primary" @click="abrirArchivo()">
                Abrir archivo de excel &nbsp;
                <v-icon>mdi-file-excel</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
          <v-layout width="1%"></v-layout>
          <v-card width="49.5%">
            <v-card-title class="grey lighten-4"
              >Vista previa del mensaje</v-card-title
            >
            <v-divider></v-divider>
            <v-card-text>
              <v-textarea disabled v-model="smsPreview"></v-textarea>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="grey lighten-4">
              <v-spacer></v-spacer>
              <v-btn fab small color="primary" dark @click="sendMultipleSMS()">
                <v-icon small>mdi-send</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-layout>
        <v-card class="mt-2" height="400">
          <v-card-title class="grey lighten-4">Archivo de excel</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-simple-table dense fixed-header height="310">
              <thead>
                <tr>
                  <th v-for="col in cols" :key="col.value">{{ col.text }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, i) in data"
                  :key="i"
                  :class="row.enviado == 'Si' ? 'green--text' : ''"
                >
                  <td v-for="col in cols" :key="col.value + i">
                    {{ row[col.value] }}
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-content>
    <v-dialog width="500" v-model="dlgSMS">
      <v-card>
        <v-card-title class="grey lighten-4">
          SMS simple
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                fab
                dark
                @click="dlgSMS = false"
                small
                color="red"
                v-on="on"
              >
                <v-icon small>mdi-close</v-icon>
              </v-btn>
            </template>
            <span>Cerrar</span>
          </v-tooltip>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field
            label="Número de destino:"
            type="phone"
            max="8"
            v-model="SMS.to"
          ></v-text-field>
          <v-textarea
            label="Escriba aquí el mensaje:"
            v-model="SMS.message"
          ></v-textarea>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="grey lighten-4">
          <v-spacer></v-spacer>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn fab dark color="primary" @click="sendSMS()" v-on="on">
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </template>
            <span>Enviar mensaje</span>
          </v-tooltip>

          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import xlsx from "xlsx";
const io = require("socket.io-client");
export default {
  name: "App",

  data: () => ({
    api: "http://coopefacsa.com:3006",
    usuario: { id: 0, nombre: "" },
    data: [],
    columnaDestinatarios: "",
    mensaje: "",
    menu: false,
    dlgSMS: false,
    dataIndex: 0,
    SMS: { to: "", message: "" },
    prefijos: [],
  }),
  watch: {
    columnaDestinatarios(value) {
      var mv = this;
      var result = "";
      if (value.toString().length === 0) {
        return;
      }
      mv.data.forEach((fila) => {
        try {
          result = parseInt(fila[value]);
        } catch (error) {
          result = "error";
        }
        if (result.toString().length != 8) {
          result = "error";
        }
      });
      if (result === "error") {
        mv.$swal({
          icon: "error",
          title: "Columna no válida",
          text:
            "La columna elejida contiene valores no válidos para ser usada como columna de destinatarios. La columna debe contener sólo números telefónicos",
        });
        mv.$set(mv, "columnaDestinatarios", "");
        mv.$refs.colDest.lazyValue = "";
        return;
      }
    },
  },
  computed: {
    cols: function() {
      var mv = this;
      var result = [];
      if (mv.data.length > 0) {
        Object.keys(mv.data[mv.dataIndex]).forEach((k) => {
          result.push({ value: k, text: k.toUpperCase() });
        });
      }
      return result;
    },
    smsPreview: function() {
      var mv = this;
      var result = mv.mensaje.toString();
      if (mv.data.length === 0) {
        return result;
      }
      mv.cols.forEach((col) => {
        var rgex = new RegExp(`@${col.text.toLowerCase()}`, "g");
        var rgex2 = new RegExp(`@${col.text}`, "g");
        result = result
          .toString()
          .replace(rgex, mv.data[mv.dataIndex][col.value]);
        result = result
          .toString()
          .replace(rgex2, mv.data[mv.dataIndex][col.value]);
      });
      return result;
    },
  },
  methods: {
    getPrefijos: function() {
      var mv = this;
      fetch(`${mv.api}/get?table=prefijos&fields=*`, { method: "get" })
        .then((res) => {
          return res.json();
        })
        .then((r) => {
          if (r.errno) {
            console.log(r);
          } else {
            mv.prefijos = r;
          }
        });
    },
    abrirArchivo: function() {
      var mv = this;
      var input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute(
        "accept",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
      );
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      input.dispatchEvent(evt);
      input.onchange = function(evt) {
        if (evt.target.files.length > 0) {
          var file = evt.target.files[0];
          var reader = new FileReader();
          reader.onload = function(e) {
            var data = new Uint8Array(e.target.result);
            var libro = xlsx.read(data, { type: "array" });
            var NombreHojas = libro.SheetNames;
            var hoja = libro.Sheets[NombreHojas[0]];
            mv.data = xlsx.utils.sheet_to_json(hoja);
            mv.data.forEach((fila) => {
              mv.$set(fila, "enviado", "No");
            });
          };
          reader.readAsArrayBuffer(file);
        }
      };
    },
    sendSMS: function() {
      var mv = this;
      mv.SMS.to=`+505${mv.SMS.to}`
      var data = JSON.stringify(mv.SMS);
      fetch(`${mv.api}/sms`, {
        body: data,
        method: "POST",
        headers: { "Content-type": "application/json" },
      })
        .then((res) => {
          return res.json();
        })
        .then((r) => {
          console.log(r);
        });
    },
    sendMultipleSMS: function() {
      var mv = this;
      if (mv.data.length === 0) {
        mv.$swal({
          icon: "error",
          title: "Error de validación",
          text: "No ha abierto el archivo con los datos de los destinatarios",
        });
        return;
      }
      if (mv.columnaDestinatarios.length === 0) {
        mv.$swal({
          icon: "error",
          title: "Error de validación",
          text:
            "No se ha definido la columna que contiene los números de los destinatarios",
        });
        return;
      }
      var i = 0;
      var interval = setInterval(function() {
        mv.dataIndex = i;
        mv.SMS.to =`${mv.data[i][mv.columnaDestinatarios]}RS`;
        mv.SMS.message = mv.smsPreview;
        mv.sendSMS();
        mv.data[i].enviado = "Si";
        if (i == mv.data.length - 1) {
          clearInterval(interval);
        }
        i += 1;
      }, 3000);
    },
  },
  mounted: function() {
    var mv = this;
    io(mv.api);
    mv.getPrefijos();
  },
};
</script>
<style lang="css" scope>
body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
</style>
